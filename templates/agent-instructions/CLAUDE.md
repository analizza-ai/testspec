# /pags-tests — Spec Driven Test generation

Run `testspec generate` (or `testspec pags-tests`) to read the current SDD change and generate `tests.md` + test stubs.

## What this command does

1. Reads spec artifacts from `openspec/changes/{latest}/` (proposal.md, design.md, specs/**/*.md, tasks.md)
2. Parses them into a SpecContext
3. Builds a prompt and either:
   - prints it to chat for you to paste back (default)
   - calls the Claude API directly (`--api` flag)
4. Writes `tests.md` with CT-01..N test cases
5. Generates unit and integration test stubs

## Usage

```bash
# generate tests.md for the latest change (prints prompt to chat)
testspec generate

# generate for a specific change
testspec generate --change my-feature

# call Claude API directly (requires ANTHROPIC_API_KEY)
testspec generate --api

# skip stub generation
testspec generate --no-stubs
```

## tests.md structure

Each CT (test case) follows this table format:

| Field               | Value                        |
|---------------------|------------------------------|
| Type                | unit / integration / e2e / load / chaos |
| Layer               | developer / qa / chaos       |
| Precondition        | ...                          |
| Input               | request / params             |
| Expected output     | response / return value      |
| DB validation       | SQL assertion or description |
| Acceptance criteria | · bullet list                |

## When pasting the prompt back

After running `testspec generate` without `--api`, paste the printed prompt into this chat.
I will generate the full `tests.md` content. Copy my output and save it to the path shown in the CLI output.
