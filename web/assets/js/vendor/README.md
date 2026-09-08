Browser UMD builds used by `learn.html` and `lab.html`. No CDN. Script tags carry **SRI** (`integrity` + `crossorigin="anonymous"`); CI runs `./scripts/check_vendor_sri.sh`.

| Package | Version | License | File |
|---------|---------|---------|------|
| [marked](https://github.com/markedjs/marked) | 15.0.12 | MIT | `marked.min.js` |
| [DOMPurify](https://github.com/cure53/DOMPurify) | 3.4.13 | Apache-2.0 / MPL-2.0 | `purify.min.js` |

Versions are also pinned in `web/package.json` so Dependabot can open bump PRs. After merging a bump:

```bash
./scripts/vendor_site_libs.sh   # npm ci → copy UMD builds → refresh SRI on learn/lab HTML
```

Or replace the `.min.js` files and license copies by hand, then set matching `integrity="sha384-…"` values (`openssl dgst -sha384 -binary FILE | openssl base64 -A`) on both HTML pages and re-run `./scripts/check_vendor_sri.sh`.
