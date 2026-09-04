.PHONY: run seed-demo stop status

OPENSEARCH_URL ?= http://localhost:9200

run:
	-docker stop micromanager-dashboard
	-docker compose -f backend/python/users-state/docker-compose.yml down
	docker compose up -d --build
	@until curl --fail --silent "$(OPENSEARCH_URL)/_cluster/health" >/dev/null; do \
		echo "Waiting for OpenSearch..."; \
		sleep 2; \
	done
	@echo "Dashboard: http://localhost:8081"

seed-demo:
	@echo "This replaces the local jira, git, gitlab, and confluence OpenSearch indices."
	OPENSEARCH_URL="$(OPENSEARCH_URL)" ./scripts/import-test-data.sh

stop:
	docker compose down

status:
	docker compose ps
