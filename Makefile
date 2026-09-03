# Common local tasks for rean-docker
PORT ?= 5501

.PHONY: help serve sync check check-km check-km-parity check-all sitemap smoke smoke-concept ci-local

help:
	@echo "rean-docker make targets:"
	@echo "  make serve         # serve web/ on http://localhost:$(PORT)"
	@echo "  make sync          # copy handbook + lab READMEs → web/content/en/"
	@echo "  make check         # fail if English site content drifted from sources"
	@echo "  make check-km      # fail if Khmer site content drifted from English structure"
	@echo "  make check-km-parity  # fail if Khmer labs drift in checklists/code/invariants"
	@echo "  make check-all     # run English + Khmer structure + parity checks"
	@echo "  make sitemap       # regenerate sitemap, robots.txt, and search indexes"
	@echo "  make smoke         # compose smoke for labs 04, 05, 09, 12, 13"
	@echo "  make smoke-concept # run.sh helpers for labs 01, 02, 06, 07, 08, 10, 11"
	@echo "  make ci-local      # content checks + sitemap + search index (Docker smokes optional)"
	@echo ""
	@echo "Override port:  make serve PORT=8080"

serve:
	@echo "Serving web/ at http://localhost:$(PORT)"
	@echo "Press Ctrl+C to stop."
	cd web && python3 -m http.server $(PORT)

sync:
	./scripts/sync_en_content.sh

check:
	./scripts/check_content_sync.sh

check-km:
	./scripts/check_km_content.sh

check-all: check check-km check-km-parity

check-km-parity:
	./scripts/check_km_parity.sh

sitemap:
	python3 ./scripts/generate_sitemap.py
	python3 ./scripts/generate_search_index.py

smoke:
	./scripts/smoke_labs.sh

smoke-concept:
	./scripts/smoke_concept_labs.sh

ci-local: check-all sitemap
	@echo ""
	@echo "ci-local passed (content + sitemap + search index)."
	@echo "Optional with Docker:  make smoke && make smoke-concept"
