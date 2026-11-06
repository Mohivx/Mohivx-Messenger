---
name: agent-skills
description: Production-grade engineering skills for AI coding agents by Addy Osmani. Governs the entire engineering lifecycle: Define (interview-me, idea-refine, spec-driven-development), Plan (planning-and-task-breakdown), Build (incremental-implementation, test-driven-development, frontend-ui-engineering, api-and-interface-design), Verify (debugging-and-error-recovery), Review (code-review-and-quality, code-simplification, security-and-hardening), and Ship.
---

# Agent Skills

## Overview

Agent Skills is a production-grade collection of engineering workflow skills organized by development phase. Each skill encodes a specific process that senior engineers follow. This meta-skill helps you discover and apply the right skill for your current task.

## Skill Discovery

When a task arrives, identify the development phase and apply the corresponding skill:

```
Task arrives
    │
    ├── Don't know what you want yet? ──────→ interview-me
    ├── Have a rough concept, need variants? → idea-refine
    ├── New project/feature/change? ──→ spec-driven-development
    ├── No quality bar written down? ──→ constraint-driven-development
    ├── Have a spec, need tasks? ──────→ planning-and-task-breakdown
    ├── Implementing code? ────────────→ incremental-implementation
    │   ├── UI work? ─────────────────→ frontend-ui-engineering
    │   ├── API work? ────────────────→ api-and-interface-design
    │   ├── Need better context? ─────→ context-engineering
    │   ├── Need doc-verified code? ───→ source-driven-development
    │   └── Stakes high / unfamiliar code? ──→ doubt-driven-development
    ├── Writing/running tests? ────────→ test-driven-development
    │   └── Browser-based? ───────────→ browser-testing-with-devtools
    ├── Something broke? ──────────────→ debugging-and-error-recovery
    ├── Reviewing code? ───────────────→ code-review-and-quality
    │   ├── Too complex? ─────────────→ code-simplification
    │   ├── Security concerns? ───────→ security-and-hardening
    │   └── Performance concerns? ────→ performance-optimization
    ├── Committing/branching? ─────────→ git-workflow-and-versioning
    ├── CI/CD pipeline work? ──────────→ ci-cd-and-automation
    ├── Deprecating/migrating? ────────→ deprecation-and-migration
    ├── Writing docs/ADRs? ───────────→ documentation-and-adrs
    ├── Adding logs/metrics/alerts? ───→ observability-and-instrumentation
    └── Deploying/launching? ─────────→ shipping-and-launch
```

## Core Operating Behaviors

These behaviors apply at all times, across all skills. They are non-negotiable.

### 1. Surface Assumptions
Never assume an answer to an ambiguous requirement. Name the ambiguity, present the viable options with trade-offs, and ask. Do not choose silently.

### 2. Think Before Coding
Understand the problem thoroughly before proposing solutions. Read existing code, identify constraints, and trace dependencies. The fastest way to write code is to know exactly what you're writing before you start.

### 3. Build Incrementally with Tests
Break work into vertical slices that can each be tested independently. Write tests that prove the slice works before moving to the next. Never build three layers of abstraction and then test them all at once.

### 4. Verify Every Claim
Don't say "this should work." Run the test, execute the command, inspect the output. If a test passes, verify it would have failed without your change. Trust verification, not intuition.

### 5. Surgical Changes
Touch only the code required for the current task. Do not reformat adjacent code, do not add unrelated "improvements," and do not clean up tech debt that you weren't asked to touch. Every changed line must trace to the task.

## Slash Commands Quick Reference

| Command | Skill | When to Use |
|---|---|---|
| `/spec` | `spec-driven-development` | Starting a new feature, project, or complex change |
| `/plan` | `planning-and-task-breakdown` | Breaking an existing spec into implementable tasks |
| `/build` | `incremental-implementation` | Building a plan or task list slice by slice |
| `/test` | `test-driven-development` | Writing tests, implementing logic with TDD |
| `/debug` | `debugging-and-error-recovery` | Investigating bugs, test failures, or crashes |
| `/review` | `code-review-and-quality` | Reviewing PRs, diffs, or uncommitted changes |
| `/simplify` | `code-simplification` | Reducing complexity, dead code, and over-engineering |
| `/security` | `security-and-hardening` | Auditing for vulnerabilities and injection flaws |
| `/ship` | `shipping-and-launch` | Preparing and validating code for deployment |
