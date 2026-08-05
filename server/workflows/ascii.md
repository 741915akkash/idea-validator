Goal
    │
    ▼
Find Workflow
    │
    ▼
Run Workflow
    │
    ▼
Load Workflow
    │
    ▼
Build Workspace Context
    │
    ▼
For Each Artifact
    │
    ├───────────────► Already Approved?
    │                     │
    │                 Yes │ No
    │                     │
    │                     ▼
    │             Find Producer Agent
    │                     │
    │                     ▼
    │              Build Agent Context
    │                     │
    │                     ▼
    │                 Run Agent
    │                     │
    │                     ▼
    │            Validate & Save Artifact
    │                     │
    └─────────────────────┘
    │
    ▼
Next Artifact
    │
    ▼
Workflow Complete