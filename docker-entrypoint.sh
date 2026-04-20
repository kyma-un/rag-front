#!/bin/sh
set -eu

API_BASE_URL_VALUE="${API_BASE_URL:-/api}"

cat > /usr/share/nginx/html/env-config.js <<EOF
window.__env = {
  API_BASE_URL: "${API_BASE_URL_VALUE}"
};
EOF
