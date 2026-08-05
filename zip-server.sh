#!/bin/bash
# Zips the "server" directory (and everything inside it) into server.zip
# Run this from the parent folder that contains "server/"

set -e

DIR_NAME="server"
ZIP_NAME="server.zip"

if [ ! -d "$DIR_NAME" ]; then
  echo "Error: directory '$DIR_NAME' not found in current folder."
  exit 1
fi

zip -r "$ZIP_NAME" "$DIR_NAME" \
  -x "*/node_modules/*" \
  -x "*/.git/*" \
  -x "*/venv/*" \
  -x "*/.venv/*" \
  -x "*/__pycache__/*" \
  -x "*/dist/*" \
  -x "*/build/*" \
  -x "*.log" \
  -x "*/.env"

echo "Created $ZIP_NAME"