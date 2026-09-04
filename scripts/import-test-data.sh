#!/usr/bin/env bash

set -euo pipefail

OPENSEARCH_URL="${OPENSEARCH_URL:-http://localhost:9200}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
INDICES=(jira git gitlab confluence)

for command in curl python3; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Required command is not installed: $command" >&2
    exit 1
  fi
done

curl_args=(
  --fail-with-body
  --silent
  --show-error
  --noproxy '*'
  --header 'Content-Type: application/json'
)

echo "Waiting for OpenSearch at ${OPENSEARCH_URL}..."
for attempt in {1..30}; do
  if curl "${curl_args[@]}" "${OPENSEARCH_URL}/_cluster/health" >/dev/null 2>&1; then
    break
  fi

  if [[ "$attempt" == 30 ]]; then
    echo "OpenSearch did not become available at ${OPENSEARCH_URL}." >&2
    exit 1
  fi

  sleep 2
done

work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

for index in "${INDICES[@]}"; do
  mapping_file="${ROOT_DIR}/.testData/${index}.mapping.json"
  data_file="${ROOT_DIR}/.data/${index}_anonymized.json"
  extra_data_file="${ROOT_DIR}/.data/${index}_comments_anonymized.json"
  index_body="${work_dir}/${index}.index.json"
  bulk_body="${work_dir}/${index}.bulk.ndjson"
  bulk_response="${work_dir}/${index}.bulk-response.json"

  if [[ ! -f "$mapping_file" || ! -f "$data_file" ]]; then
    echo "Missing test data for index '${index}'." >&2
    exit 1
  fi

  python3 - "$index" "$mapping_file" "$data_file" "$extra_data_file" "$index_body" "$bulk_body" <<'PY'
import json
import os
import sys

index, mapping_path, data_path, extra_data_path, index_body_path, bulk_body_path = sys.argv[1:]

with open(mapping_path, encoding="utf-8") as source:
    exported_mapping = json.load(source)

try:
    properties = exported_mapping[index]["mappings"]["_doc"]["properties"]
except KeyError as error:
    raise SystemExit(f"Unexpected mapping format in {mapping_path}: missing {error}")

with open(index_body_path, "w", encoding="utf-8") as target:
    json.dump({"mappings": {"properties": properties}}, target, ensure_ascii=False)

with (
    open(bulk_body_path, "w", encoding="utf-8") as target,
):
    source_paths = [data_path]
    if os.path.exists(extra_data_path):
        source_paths.append(extra_data_path)

    for source_path in source_paths:
        with open(source_path, encoding="utf-8") as source:
            for line_number, line in enumerate(source, start=1):
                if not line.strip():
                    continue

                document = json.loads(line)
                document_index = document.get("_index")
                if document_index != index:
                    raise SystemExit(
                        f"{source_path}:{line_number}: expected index {index!r}, "
                        f"got {document_index!r}"
                    )

                action = {"index": {"_index": index, "_id": document["_id"]}}
                target.write(json.dumps(action, ensure_ascii=False) + "\n")
                target.write(json.dumps(document["_source"], ensure_ascii=False) + "\n")
PY

  echo "Recreating index '${index}'..."
  delete_status="$(
    curl --silent --show-error --noproxy '*' \
      --output /dev/null \
      --write-out '%{http_code}' \
      --request DELETE \
      "${OPENSEARCH_URL}/${index}"
  )"
  if [[ "$delete_status" != 200 && "$delete_status" != 404 ]]; then
    echo "Failed to delete index '${index}' (HTTP ${delete_status})." >&2
    exit 1
  fi

  curl "${curl_args[@]}" \
    --request PUT \
    --data-binary "@${index_body}" \
    "${OPENSEARCH_URL}/${index}" >/dev/null

  curl "${curl_args[@]}" \
    --request POST \
    --data-binary "@${bulk_body}" \
    "${OPENSEARCH_URL}/_bulk" >"$bulk_response"

  python3 - "$index" "$bulk_response" <<'PY'
import json
import sys

index, response_path = sys.argv[1:]
with open(response_path, encoding="utf-8") as source:
    response = json.load(source)

if response.get("errors"):
    failures = [
        item["index"].get("error")
        for item in response.get("items", [])
        if item.get("index", {}).get("error")
    ]
    raise SystemExit(
        f"Bulk import for {index!r} failed: "
        + json.dumps(failures[:5], ensure_ascii=False)
    )
PY
done

curl "${curl_args[@]}" \
  --request POST \
  "${OPENSEARCH_URL}/jira,git,gitlab,confluence/_refresh" >/dev/null

echo
curl --fail-with-body --silent --show-error --noproxy '*' \
  "${OPENSEARCH_URL}/_cat/indices/jira,git,gitlab,confluence?v&h=index,docs.count,store.size"
