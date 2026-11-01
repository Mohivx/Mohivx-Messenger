# Karpathy Guidelines — Core Development Principles

These behavioral guidelines reduce common LLM coding mistakes and enforce Andrej Karpathy's four core principles across all development in this project.

## 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**
- State assumptions explicitly. If uncertain, ask rather than guess.
- If multiple interpretations exist, present them — do not pick silently.
- If a simpler approach exists, propose it. Push back when warranted.
- If something is unclear or ambiguous, stop, name what is confusing, and ask for clarification.

## 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**
- Build only the features requested.
- No unnecessary abstractions for single-use code.
- No speculative "flexibility" or unrequested configurability.
- No convoluted error handling for impossible scenarios.
- If 200 lines could be 50, rewrite and simplify.
- The test: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**
- Do not modify or "improve" adjacent code, comments, or formatting orthogonal to the task.
- Do not refactor components that are working properly.
- Match existing code style and conventions.
- If unrelated dead code is found, mention it — do not delete it without request.
- Clean up any unused imports, variables, or functions created by your changes.
- The test: Every single changed line must trace directly to the user's request.

## 4. Goal-Driven Execution
**Define success criteria. Loop until verified.**
- Transform tasks into verifiable goals:
  - "Add validation" → "Write test for invalid inputs, then make it pass"
  - "Fix the bug" → "Reproduce with a test/check, then make it pass"
  - "Refactor X" → "Ensure tests and functionality pass before and after"
- For multi-step tasks, execute with clear verify steps:
  1. [Step] → verify: [check]
  2. [Step] → verify: [check]
  3. [Step] → verify: [check]
