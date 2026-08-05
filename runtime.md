# Runtime

> Living document describing how the Runtime works internally.
>
> Unlike `ARCHITECTURE.md`, this document may evolve as the implementation improves.

---

# Purpose

The Runtime is responsible for executing an agent until it completes.

It provides a deterministic execution environment for an LLM by:

- maintaining conversation state
- executing tools
- enforcing the runtime protocol
- validating responses
- collecting telemetry
- persisting execution state

The Runtime **does not reason**.

Reasoning belongs entirely to the Agent + LLM.

---

# Responsibilities

The Runtime owns:

- Runtime state
- LLM loop
- Tool execution
- Protocol validation
- Execution policies
- Runtime lifecycle
- Error handling
- Persistence
- Telemetry

The Runtime never owns:

- Business logic
- SQL queries
- Prompt engineering
- Agent reasoning
- Workspace decisions

---

# High-Level Flow

```text
API
 │
 │ Start Agent Run
 ▼
Build Runtime State
 │
 ▼
Build Agent Context
 │
 ▼
Build Prompt
 │
 ▼
Runtime Loop
 │
 ├── Ask LLM
 │
 ├── Validate Response
 │
 ├── Tool?
 │      │
 │      ├── Execute Tool(s)
 │      ├── Append Tool Results
 │      └── Continue
 │
 └── Finish?
        │
        ├── Validate Output
        ├── Save Results
        └── Return
```

---

# Runtime Lifecycle

```text
PENDING
    │
    ▼
RUNNING
    │
    ├─────────────► FAILED
    │
    ├─────────────► CANCELLED
    │
    ▼
FINISHED
```

Definitions:

| Status | Meaning |
|----------|---------|
| PENDING | Run created but execution has not started |
| RUNNING | Runtime loop is active |
| FINISHED | Agent completed successfully |
| FAILED | Unhandled runtime failure |
| CANCELLED | User or system stopped execution |

Retries create a **new runtime execution**.

---

# Runtime State

```js
{
    protocolVersion,

    runId,

    agent,

    iteration,

    messages,

    toolHistory,

    limits,

    run: {
        status,
        startedAt,
        finishedAt,

        llm: {
            rawResponses:[]
        }
    }
}
```

Runtime state is the single source of truth during execution.

---

# Runtime Loop

Pseudo-code:

```js
state = createRuntimeState()

while (true) {

    policy.beforeIteration(state)

    response = askLLM(state)

    validateProtocol(response)

    switch (response.action) {

        case TOOL:

            executeRequestedTools()

            appendToolResults()

            continue

        case FINISH:

            validateFinish()

            persist()

            return

    }

}
```

The Runtime only reacts to protocol messages.

---

# Runtime Protocol

The LLM communicates exclusively through protocol responses.

Supported actions:

```text
tool
finish
```

No other actions are valid.

---

## Tool Response

```json
{
    "protocolVersion":1,
    "action":"tool",
    "toolRequests":[]
}
```

The Runtime:

1. validates the request
2. executes tools
3. appends results
4. continues the loop

---

## Finish Response

```json
{
    "protocolVersion":1,
    "action":"finish",
    "summary":"",
    "artifacts":[],
    "tasks":[]
}
```

The Runtime:

- validates
- persists
- returns

Execution ends.

---

# Tool Execution

```text
LLM

↓

Tool Request

↓

Runtime Validation

↓

Tool Service

↓

Tool Registry

↓

Tool Execute

↓

Runtime

↓

LLM
```

The Runtime is the only component allowed to invoke tools.

Agents never execute tools directly.

---

# Execution Policy

Before every iteration, the Runtime checks execution policy.

Typical checks:

- Maximum iterations
- Runtime timeout
- Cancellation
- Workspace limits
- Approval requirements
- Credit limits

Example:

```text
beforeIteration()

↓

beforeToolExecution()

↓

beforeFinish()
```

Policies determine **whether** execution may continue.

They never perform work themselves.

---

# Error Handling

Runtime errors are represented by typed errors.

Examples:

```text
INVALID_PROTOCOL

MAX_ITERATIONS_EXCEEDED

TOOL_NOT_ALLOWED

RUNTIME_TIMEOUT

INVALID_FINISH_RESPONSE
```

The Runtime should never rely on string matching.

---

# Persistence

Typical persistence events:

```text
Run Created

↓

Run Started

↓

Tool Executed

↓

Tool Result Stored

↓

Run Finished

or

Run Failed
```

Persistence is owned by the Runtime.

Agents never write directly to storage.

---

# Message Flow

```text
System Prompt
        │
        ▼
User Context
        │
        ▼
LLM
        │
        ▼
Runtime
        │
 ┌──────┴─────────┐
 │                │
 ▼                ▼
Tool          Finish
 │                │
 ▼                ▼
Tool Result    Persist
 │                │
 └──────┬─────────┘
        ▼
Continue Loop
```

---

# Sequence Diagram

```text
API
 │
 │ Run Agent
 ▼

Runtime
 │
 │ buildContext()
 ▼

Agent
 │
 │ buildPrompt()
 ▼

Runtime
 │
 │ askLLM()
 ▼

LLM
 │
 │ protocol response
 ▼

Runtime
 │
 ├── tool?
 │      │
 │      ▼
 │   Tool Service
 │      │
 │      ▼
 │     Tool
 │      │
 │      ▼
 │   Tool Result
 │
 └── finish?
        │
        ▼
Persist

        ▼

Return
```

---

# Component Responsibilities

| Component | Responsibility |
|------------|----------------|
| API | Starts execution |
| Runtime | Controls execution |
| Agent | Builds context and prompts |
| LLM | Performs reasoning |
| Tool Service | Invokes tools |
| Tool | Performs deterministic work |
| Persistence | Stores execution |
| Human | Approves workspace knowledge |

---

# Runtime Invariants

The Runtime guarantees:

- Only valid protocol messages are executed.
- Tools are executed only by the Runtime.
- Runtime state is always internally consistent.
- Tool execution order is deterministic.
- Every run has a unique Run ID.
- Execution ends only with `FINISHED`, `FAILED`, or `CANCELLED`.

These invariants should hold regardless of which agent or LLM provider is being used.

---

# Future Enhancements

Potential additions that do **not** change the Runtime contract:

- Streaming LLM responses
- Parallel tool execution
- Tool approval gates
- Checkpointing and resume
- Distributed execution
- Cost tracking
- Execution tracing
- Metrics dashboards
- Multi-agent orchestration

These can be implemented while preserving the Runtime Protocol and Runtime Contract.