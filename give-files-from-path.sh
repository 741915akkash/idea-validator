#!/bin/bash

OUTPUT="give-files-from-path.txt"

FILES=(
4. Runtime Engine

server/services/runtime/run-runtime.js
server/services/runtime/runtime-state.js
server/services/runtime/protocol.js
server/services/runtime/run-llm-step.js
server/services/runtime/validate-runtime-response.js
server/services/runtime/execute-tool-requests.js
server/services/runtime/runtime-instructions.js
server/services/runtime/execution-policy.js
server/services/runtime/finish-schema.js
server/services/runtime/tool-request-schema.js


5. Artifact System

server/artifacts/registry.js
server/artifacts/create-artifact.js
server/artifacts/service.js
server/artifacts/lifecycle.js


6. Tool System

server/tools/registry.js
server/tools/service.js
server/tools/tool-contract.js


7. Goal System

server/goals/registry.js
server/goals/service.js


8. Workspace

server/services/workspaces/build-workspace-context.js


9. API

server/api/agents/run.post.js

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