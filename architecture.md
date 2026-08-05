# GoLaunchScall Architecture Freeze

**Version:** 1.0
**Status:** Frozen
**Last Updated:** 2026-07-25

---

# Purpose

This document defines the core architecture contracts of the platform.

Everything below is considered stable.

Changing these contracts should be treated as a breaking architectural change.

Individual agents, tools, prompts and UI may evolve independently without changing these contracts.

---

# Design Principles

- Runtime owns execution.
- Agents own reasoning.
- Tools perform deterministic work.
- Artifacts are the shared knowledge of the workspace.
- Humans approve workspace knowledge.
- Everything important is a registry.
- Components communicate only through contracts.

---

# System Layers

```
API

↓

Runtime

↓

Agent

↓

Tools

↓

External Systems
```

Workspace knowledge exists independently as Artifacts.

---

# Runtime Contract (v1)

The Runtime is responsible for:

- execution loop
- protocol enforcement
- tool execution
- iteration limits
- runtime state
- error handling
- persistence
- telemetry

The Runtime never:

- contains business logic
- knows SQL
- knows prompt contents
- reasons
- edits artifacts

Agents return protocol responses.

Runtime executes them.

---

# Runtime Protocol (v1)

LLM responses may only contain:

```
tool
finish
```

Tool requests:

```
{
    protocolVersion,
    action,
    toolRequests:[]
}
```

Finish responses:

```
{
    protocolVersion,
    action,
    summary,
    artifacts,
    tasks
}
```

Any other response is invalid.

---

# Agent Contract (v1)

Every agent exports:

```
id
version

name
description

contract

buildContext()
buildPrompt()
parseOutput()
```

Agents never:

- execute tools directly
- access databases
- call other agents
- modify runtime state

Agents reason only from provided context.

---

# Tool Contract (v1)

Every tool exports:

```
id
version

name
description

inputSchema
outputSchema

validateInput()
normalizeInput()

validateOutput()
normalizeOutput()

execute()
```

Tools are:

- stateless
- deterministic
- independently testable

Tools never:

- know workspaces
- know agents
- call the LLM
- contain business logic

---

# Artifact Contract (v1)

Artifacts are the shared knowledge model.

Artifacts define:

```
id
version
type
schema
lifecycle
```

Artifacts may be:

- immutable
- versioned

Artifacts become workspace knowledge only after approval.

---

# Registries

The platform is metadata-driven.

Current registries:

- Agent Registry
- Tool Registry
- Artifact Registry
- Goal Registry
- LLM Provider Registry

The Runtime discovers components only through registries.

---

# Workspace Rules

Workspace state consists only of approved artifacts.

Agents receive workspace context.

Agents produce candidate artifacts.

Humans approve knowledge before it becomes part of the workspace.

---

# Ownership

| Layer | Owns |
|---------|------|
| Runtime | Execution |
| Agent | Reasoning |
| Tool | Deterministic Actions |
| Artifact | Knowledge |
| Registry | Discovery |
| Human | Approval |

---

# Dependency Rules

```
Runtime
    ↓

Agent
    ↓

Tool
```

Never:

```
Tool → Agent

Tool → Runtime

Agent → Agent

Tool → Database

Agent → Database
```

All communication flows through the Runtime.

---

# Stability Policy

The following are frozen for Version 1:

- Runtime Contract
- Runtime Protocol
- Agent Contract
- Tool Contract
- Artifact Contract

Changes require a deliberate architecture version bump.

Everything else may evolve freely.

---

# Philosophy

The platform is built on a simple separation of responsibilities:

- Runtime executes.
- Agents think.
- Tools act.
- Artifacts remember.
- Humans decide.