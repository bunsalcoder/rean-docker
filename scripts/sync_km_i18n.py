#!/usr/bin/env python3
"""Sync Khmer chapter titles into i18n-km.js and normalize TOC heading."""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / "web/content/km/guide.md"
I18N_KM = ROOT / "web/assets/js/i18n-km.js"
LEARN_JS = ROOT / "web/assets/js/learn.js"

PURE_TOC = "## " + "".join(
    map(
        chr,
        [
            0x178F,
            0x17B6,
            0x179A,
            0x17B6,
            0x1784,
            0x1781,
            0x17D2,
            0x179B,
            0x17B9,
            0x1798,
            0x179F,
            0x17B6,
            0x179A,
        ],
    )
)


def main() -> None:
    lines = GUIDE.read_text(encoding="utf-8").splitlines()
    for i, line in enumerate(lines):
        if line.startswith("## ") and (
            "Table of contents" in line or "\u1781\u17d2\u179b\u17b9\u1798" in line
        ):
            lines[i] = PURE_TOC
            break
    GUIDE.write_text("\n".join(lines) + "\n", encoding="utf-8")

    chapters: dict[str, str] = {}
    for line in lines:
        m = re.match(r"^## (\d+)\. (.+)$", line)
        if m:
            chapters[m.group(1)] = m.group(2).strip()
            continue
        if line.startswith("## ") and line != PURE_TOC and "Table of contents" not in line:
            if "how-to-use" not in chapters:
                chapters["how-to-use"] = line[3:].strip()

    if "how-to-use" not in chapters or any(str(i) not in chapters for i in range(1, 21)):
        raise SystemExit(f"Unexpected chapter parse: {sorted(chapters)}")

    raw = subprocess.check_output(
        [
            "node",
            "-e",
            (
                'const fs=require("fs"); const vm=require("vm"); const ctx={window:{}}; '
                "vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8'), ctx); "
                "process.stdout.write(JSON.stringify(ctx.window.REAN_I18N_KM));"
            ),
            str(I18N_KM),
        ],
        text=True,
    )
    obj = json.loads(raw)
    obj["chapter.how-to-use"] = chapters["how-to-use"]
    for i in range(1, 21):
        obj[f"chapter.{i}"] = chapters[str(i)]

    I18N_KM.write_text(
        "/* Khmer UI strings for rean-docker. Loaded before i18n.js */\n"
        "window.REAN_I18N_KM = "
        + json.dumps(obj, ensure_ascii=False, indent=2, sort_keys=True)
        + ";\n",
        encoding="utf-8",
    )

    js = LEARN_JS.read_text(encoding="utf-8")
    m = re.search(r'if \(CHAPTERS\[s\.ci\]\.id === "how-to-use"\) \{\n.*?\}', js, re.S)
    if not m:
        raise SystemExit("learn.js how-to-use TOC block not found")
    block = (
        "if (CHAPTERS[s.ci].id === \"how-to-use\") {\n"
        "      const tocAt = lines.findIndex(\n"
        "        (line, idx) =>\n"
        "          idx > s.index &&\n"
        "          (/^## Table of contents$/m.test(line) || line.trim() === "
        + json.dumps(PURE_TOC, ensure_ascii=False)
        + ")\n"
        "      );\n"
        "      if (tocAt !== -1) end = tocAt;\n"
        "    }"
    )
    LEARN_JS.write_text(js[: m.start()] + block + js[m.end() :], encoding="utf-8")

    print("TOC:", PURE_TOC)
    print("how-to-use:", chapters["how-to-use"])
    print("chapter.1:", chapters["1"])
    print("i18n keys:", len(obj))


if __name__ == "__main__":
    main()
