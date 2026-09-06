#!/bin/bash

OUTPUT="give-files-from-path.txt"

FILES=(
app/components/crm/sequences/SequenceEditor.vue
app/stores/sequences.js
server/api/crm/sequences/create.post.js
server/api/crm/sequences/update.patch.js
server/api/crm/sequences/index.get.js
server/api/crm/sequences/by-id.get.js
server/api/crm/leads/follow-up/done.post.js
)

> "$OUTPUT"

echo "# Review Files" >> "$OUTPUT"
echo "" >> "$OUTPUT"

for FILE in "${FILES[@]}"; do
    echo "============================================================" >> "$OUTPUT"
    echo "FILE: $FILE" >> "$OUTPUT"
    echo "============================================================" >> "$OUTPUT"
    echo "" >> "$OUTPUT"

    if [ -f "$FILE" ]; then
        cat "$FILE" >> "$OUTPUT"
    else
        echo "FILE NOT FOUND" >> "$OUTPUT"
    fi

    echo "" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
done

echo "Created $OUTPUT"