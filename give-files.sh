#!/usr/bin/env bash

# Dumps all files under:
#   server/artifacts
#   server/services/artifacts
#
# into one review file.

OUTPUT="give-files.txt"

> "$OUTPUT"

find server/workflows/ server/services/workflows/ server/services/orchestrator/ \
  -type f \
  ! -path "*/node_modules/*" \
  | sort \
  | while read -r file
do
  {
    echo "============================================================"
    echo "FILE: $file"
    echo "============================================================"
    echo
    cat "$file"
    echo
    echo
  } >> "$OUTPUT"
done

echo "Created $OUTPUT"