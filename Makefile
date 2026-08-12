# Common local tasks for rean-docker
PORT ?= 5501

.PHONY: help serve sync check

help:
	@echo "rean-docker make targets:"
	@echo "  make serve   # serve web/ on http://localhost:$(PORT)"
	@echo "  make sync    # copy handbook + lab READMEs → web/content/en/"
	@echo "  make check   # fail if English site content drifted from sources"
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
