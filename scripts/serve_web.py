#!/usr/bin/env python3
"""Serve web/ with a GitHub Pages–like 404.html fallback."""

from __future__ import annotations

import argparse
import os
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class PagesLikeHandler(SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        if code == 404:
            root = Path(self.directory or os.getcwd())
            fallback = root / "404.html"
            if fallback.is_file():
                try:
                    body = fallback.read_bytes()
                except OSError:
                    return super().send_error(code, message, explain)
                self.send_response(404, message)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                if self.command != "HEAD":
                    self.wfile.write(body)
                return
        return super().send_error(code, message, explain)

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=5501)
    parser.add_argument(
        "--directory",
        type=Path,
        default=Path(__file__).resolve().parent.parent / "web",
    )
    args = parser.parse_args()
    directory = str(args.directory.resolve())
    if not Path(directory).is_dir():
        raise SystemExit(f"Not a directory: {directory}")

    handler = partial(PagesLikeHandler, directory=directory)
    with ThreadingHTTPServer(("127.0.0.1", args.port), handler) as httpd:
        print(f"Serving {directory} at http://127.0.0.1:{args.port}")
        print("404 responses use web/404.html (Pages-like). Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
