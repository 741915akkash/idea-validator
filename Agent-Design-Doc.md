# GoLaunchScall Agent Design Principles

## Purpose

This document defines what qualifies as a good agent in GoLaunchScall.

Its purpose is to ensure that:

* Built-in agents remain focused, high quality, and maintainable.
* Future user-created agents are designed for success.
* The Agent Builder can automatically evaluate and improve proposed agents.
* Agents collaborate through workspace knowledge rather than becoming large, monolithic assistants.

---

# Core Philosophy

An agent is **not** a chatbot.

An agent is a specialized professional that performs one well-defined job, consumes existing workspace knowledge, and contributes new knowledge back to the workspace.

Agents should collaborate through artifacts—not through direct communication with other agents.

```
Approved Workspace Knowledge
            │
            ▼
        Specialized Agent
            │
            ▼
     New Workspace Knowledge
```

Every agent should make the workspace smarter after it runs.

---

# Definition of an Agent

A GoLaunchScall agent has:

* One primary responsibility.
* One area of expertise.
* A well-defined set of inputs.
* A well-defined set of outputs.
* A focused toolset.
* A clear definition of success.

If an agent has multiple unrelated responsibilities, it should be split.

---

# Agent Design Principles

## 1. Single Goal

Every agent should have one primary objective.

Good examples:

* Research the market.
* Analyze competitors.
* Discover customer pain points.
* Create a product roadmap.
* Generate marketing copy.

Poor examples:

* Validate my startup.
* Research everything.
* Help me build my company.

A good agent can usually describe its job in one sentence.

---

## 2. Single Expertise

An agent should represent one type of professional.

Examples:

* Market Research Analyst
* Competitor Analyst
* UX Researcher
* Product Manager
* Marketing Strategist
* Financial Analyst

Avoid agents that attempt to replace an entire consulting company.

---

## 3. Single Area of Knowledge

An agent should deepen one area of workspace knowledge.

Examples:

Market Research Agent

Produces:

* Market Analysis
* Market Opportunity

Customer Research Agent

Produces:

* Customer Persona
* Customer Pain

Competitor Research Agent

Produces:

* Competitor Analysis

Risk Analysis Agent

Produces:

* Major Risk

Each agent owns a coherent portion of the workspace knowledge graph.

---

## 4. Consume Existing Knowledge

Agents should begin by understanding what already exists.

Before creating new artifacts, an agent should:

* Read approved workspace artifacts.
* Reuse existing knowledge.
* Extend previous work.
* Avoid duplication.
* Update outdated conclusions when appropriate.

Agents should treat approved artifacts as the current state of workspace knowledge.

---

## 5. Produce New Knowledge

Every successful run should leave the workspace in a better state.

Examples:

Before

* No competitor analysis.

After

* Complete competitor analysis.

Before

* One customer persona.

After

* Expanded persona with better evidence.

An agent should create or improve knowledge—not simply repeat it.

---

## 6. Small Artifact Set

Each agent should produce a small number of closely related artifacts.

Recommended:

1–3 artifact types.

Acceptable:

Up to 5 related artifact types.

Poor:

Many unrelated artifact types.

Large outputs usually indicate multiple jobs.

---

## 7. Focused Tool Usage

Agents should require a coherent toolset.

Example:

Competitor Research Agent

Tools:

* Search
* Browser

Marketing Agent

Tools:

* Documents
* Brand Assets
* Image Generation

If two parts of an agent require completely different tools, they probably belong in separate agents.

---

## 8. Independent Value

A user should be able to run an agent independently.

Examples:

✓ Run Market Research

✓ Run Competitor Research

✓ Run Marketing Strategy

Users should not be forced to execute large "do everything" workflows.

---

## 9. Clear Success Criteria

Every agent should have one definition of success.

Example:

Competitor Research Agent

Success means:

"The workspace now contains an accurate and useful competitor analysis."

Bad example:

Success means:

* Better marketing
* Better roadmap
* Better pricing
* Better fundraising

Those represent multiple objectives.

---

## 10. Stable Instructions

An agent's responsibilities should remain stable over time.

Good prompts evolve slowly.

If a prompt continuously grows with new responsibilities, it is probably hiding multiple agents.

---

# When Should an Agent Be Split?

An agent should usually be divided if any of the following are true.

## Multiple Primary Goals

Example:

Research competitors.

Create roadmap.

Write emails.

Generate landing page.

These are separate jobs.

---

## Multiple Specialist Roles

If different professionals would perform the work, they should usually become separate agents.

Example:

Market Analyst

Competitor Analyst

Marketing Strategist

Financial Analyst

Each deserves its own agent.

---

## Multiple Unrelated Artifacts

Example:

Customer Persona

Roadmap

Landing Page

Pitch Deck

These belong to different domains.

---

## Multiple Toolsets

If one responsibility requires:

* Search
* Browser

and another requires:

* Email
* Calendar
* CRM

those responsibilities should probably become separate agents.

---

## Multiple Definitions of Success

If the agent cannot answer:

"What does success look like?"

with a single sentence, it should usually be split.

---

# The Human Specialist Test

Ask:

"If I hired one expert to perform this work for a week, who would they be?"

Good answers:

* Market Research Analyst
* Pricing Consultant
* Product Manager

Poor answers:

* Startup Consultant
* Business Advisor
* Co-Founder

Those are collections of specialists, not specialists themselves.

---

# Agent Quality Checklist

Every proposed agent should satisfy the following checklist.

| Criterion                             | Pass |
| ------------------------------------- | ---- |
| One primary goal                      | □    |
| One specialist role                   | □    |
| Small artifact set                    | □    |
| Focused toolset                       | □    |
| Consumes existing workspace knowledge | □    |
| Produces new workspace knowledge      | □    |
| Valuable when run independently       | □    |
| Single definition of success          | □    |
| Stable long-term responsibility       | □    |

Interpretation:

9/9 — Excellent agent.

7–8/9 — Good agent.

5–6/9 — Review for possible split.

Below 5/9 — Should usually be redesigned as multiple agents.

---

# Agent Builder Rules (Future)

The Agent Builder should automatically evaluate every proposed agent.

Example:

User proposal:

Startup Advisor Agent

Responsibilities:

* Research market
* Analyze competitors
* Build roadmap
* Write marketing copy
* Create pitch deck

Evaluation:

❌ Multiple objectives.

❌ Multiple specialist roles.

❌ Multiple artifact domains.

❌ Multiple toolsets.

Recommendation:

Split into:

* Market Research Agent
* Competitor Research Agent
* Planning Agent
* Marketing Agent
* Pitch Deck Agent

The user may choose to keep the original design, but GoLaunchScall should clearly explain that smaller, specialized agents generally produce higher-quality results.

---

# Long-Term Vision

GoLaunchScall is a platform of collaborating specialists.

Agents do not replace an entire company.

Instead, each agent performs one professional role exceptionally well.

They collaborate by reading and contributing to a shared, human-verified workspace knowledge base.

As the workspace grows, every new agent benefits from the accumulated knowledge created by previous agents, resulting in progressively better outputs without increasing the complexity of any individual agent.
