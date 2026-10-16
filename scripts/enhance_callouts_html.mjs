/**
 * Turn labeled Markdown blockquotes (post-marked HTML) into callout widgets.
 * Mirrors web/assets/js/guide.js enhanceCallouts for static page generation.
 */

const KIND = [
  {
    re: /^(expected\s*output|លទ្ធផលដែលរំពឹងទុក)\s*:?\s*$/i,
    kind: "expected",
    collapsible: true,
  },
  {
    re: /^(common\s*error|កំហុសទូទៅ)\s*:?\s*$/i,
    kind: "error",
    collapsible: true,
  },
  {
    re: /^(hint|tip|គន្លឹះ|ណែនាំ)\s*:?\s*$/i,
    kind: "hint",
    collapsible: false,
  },
  {
    re: /^(pitfall|អន្ទាក់)\s*:?\s*$/i,
    kind: "pitfall",
    collapsible: false,
  },
];

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * @param {string} html
 * @returns {string}
 */
export function enhanceCalloutsHtml(html) {
  if (!html || !html.includes("<blockquote>")) return html;

  return html.replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, (full, inner) => {
    if (/md-callout/.test(inner)) return full;

    const strongMatch = inner.match(
      /<p>\s*<strong>([\s\S]*?)<\/strong>\s*([\s\S]*?)<\/p>([\s\S]*)/i
    );
    if (!strongMatch) return full;

    const labelRaw = strongMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    const titleText = labelRaw.replace(/:$/, "").trim();
    const match = KIND.find((row) => row.re.test(titleText));
    if (!match) return full;

    const firstRest = strongMatch[2].trim();
    const after = strongMatch[3] || "";
    const bodyParts = [];
    if (firstRest) bodyParts.push(`<p>${firstRest}</p>`);
    if (after.trim()) bodyParts.push(after.trim());
    const bodyHtml = bodyParts.join("\n") || "";

    const safeTitle = escapeHtml(titleText);
    if (match.collapsible) {
      return `<details class="md-callout md-callout-${match.kind}">
<summary class="md-callout-title">${safeTitle}</summary>
<div class="md-callout-body">
${bodyHtml}
</div>
</details>`;
    }

    return `<aside class="md-callout md-callout-${match.kind}" role="note">
<div class="md-callout-body">
<p class="md-callout-title">${safeTitle}</p>
${bodyHtml}
</div>
</aside>`;
  });
}
