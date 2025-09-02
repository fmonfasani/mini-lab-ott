#!/usr/bin/env bash
set -euo pipefail

echo "== Health checks =="
for url in "http://localhost:8080/health" "http://localhost:8080/stub_status" "http://localhost:5000/api/health" "http://localhost:9090/-/healthy"; do
  printf "%-40s" "$url"
  code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || true)
  echo "HTTP $code"
done
