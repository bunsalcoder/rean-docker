# Common local tasks for rean-docker
PORT ?= 5501

.PHONY: help serve sync check check-km check-km-parity check-lab-invariants check-all check-links check-vendor-sri check-vendor-versions check-routes sync-routes check-site-smoke sitemap sync-km-i18n sync-prod-dockerfiles bump-node-deps smoke smoke-concept ci-local refresh-digests refresh-digests-check

help:
	@echo "rean-docker make targets:"
	@echo "  make serve         # serve web/ on http://127.0.0.1:$(PORT) (Pages-like 404)"
	@echo "  make sync          # copy handbook + lab READMEs → web/content/en/"
	@echo "  make sync-routes   # regenerate web/assets/js/routes.js from routes.json"
	@echo "  make check         # fail if English site content drifted from sources"
	@echo "  make check-km      # fail if Khmer site content drifted from English structure"
	@echo "  make check-km-parity  # fail if Khmer labs drift in checklists/code/invariants"
	@echo "  make check-lab-invariants  # fail if shared Node digest/Express/Dockerfile twins drift"
	@echo "  make check-routes  # fail if routes.js drifted from routes.json"
	@echo "  make check-links   # fail if HTML/CSS/MD points at missing local files"
	@echo "  make check-vendor-sri  # fail if marked/DOMPurify SRI hashes drifted"
	@echo "  make check-vendor-versions  # fail if package.json ≠ vendor README versions"
	@echo "  make check-site-smoke  # HTTP smoke for pages, routes, indexes, 404"
	@echo "  make check-all     # content + routes + links + vendor + site smoke checks"
	@echo "  make sitemap       # regenerate sitemap, robots.txt, and search indexes"
	@echo "  make sync-km-i18n  # refresh Khmer chapter titles in i18n-km.js from km guide"
	@echo "  make sync-prod-dockerfiles  # copy Lab 09 Dockerfile → Labs 12 and 13"
	@echo "  make bump-node-deps PKG=express@^4.21.2  # bump a shared dep across Node labs + locks"
	@echo "  make refresh-digests       # update Lab 13 Postgres/Redis Compose digests from Hub"
	@echo "  make refresh-digests-check # fail if Lab 13 Compose digests drifted from Hub"
	@echo "  make smoke         # compose smoke via labs 04, 05, 09, 12, 13 run.sh"
	@echo "  make smoke-concept # run.sh helpers for labs 01–03, 06–08, 10, 11"
	@echo "  make ci-local      # content checks + sitemap + search index (Docker smokes optional)"
	@echo ""
	@echo "Override port:  make serve PORT=8080"

serve:
	python3 ./scripts/serve_web.py --port $(PORT)

bump-node-deps:
	@test -n "$(PKG)" || (echo "Usage: make bump-node-deps PKG=express@^4.21.2" && exit 1)
	./scripts/bump_shared_node_deps.sh "$(PKG)"

sync:
	./scripts/sync_en_content.sh

check:
	./scripts/check_content_sync.sh

check-km:
	./scripts/check_km_content.sh

check-all: check check-km check-km-parity check-lab-invariants check-routes check-links check-vendor-sri check-vendor-versions check-site-smoke

check-km-parity:
	./scripts/check_km_parity.sh

check-lab-invariants:
	./scripts/check_lab_invariants.sh

check-routes:
	./scripts/check_routes_sync.sh

check-links:
	python3 ./scripts/check_site_links.py

check-vendor-sri:
	./scripts/check_vendor_sri.sh

check-vendor-versions:
	./scripts/check_vendor_versions.sh

check-site-smoke:
	python3 ./scripts/check_site_smoke.py

sitemap:
	python3 ./scripts/generate_sitemap.py
	python3 ./scripts/generate_search_index.py

sync-routes:
	python3 ./scripts/sync_routes_js.py

sync-km-i18n:
	python3 ./scripts/sync_km_i18n.py

sync-prod-dockerfiles:
	./scripts/sync_prod_dockerfiles.sh

refresh-digests:
	./scripts/refresh_compose_digests.sh

refresh-digests-check:
	./scripts/refresh_compose_digests.sh --check

smoke:
	./scripts/smoke_labs.sh

smoke-concept:
	./scripts/smoke_concept_labs.sh

ci-local: check-all sitemap
	@git diff --exit-code -- \
		web/sitemap.xml \
		web/robots.txt \
		web/assets/search-index-en.json \
		web/assets/search-index-km.json \
		|| (echo "Generated site artifacts drifted. Commit make sitemap output." && exit 1)
	@echo ""
	@echo "ci-local passed (content + sitemap + search index)."
	@echo "Optional with Docker:  make smoke && make smoke-concept"
