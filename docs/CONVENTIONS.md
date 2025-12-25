# Project Conventions

This document defines the coding and documentation conventions for this project.

## Language and Spelling

**ALL text content in this project MUST use British English spelling and grammar.**

This applies to:
- All code comments and documentation
- Variable names, function names, and type names
- User-facing text (UI labels, messages, error messages)
- README files, documentation, and guides
- Commit messages and PR descriptions
- API response messages
- Log messages and console output

### British vs American English Reference

| British English | American English |
|-----------------|------------------|
| colour | color |
| favourite | favorite |
| analyse | analyze |
| optimise | optimize |
| recognise | recognize |
| behaviour | behavior |
| centre | center |
| licence (noun) | license (noun) |
| defence | defense |
| organisation | organization |
| summarise | summarize |
| realise | realize |
| catalogue | catalog |
| travelled | traveled |
| cancelled | canceled |

### Code Examples

```typescript
// CORRECT - British English
const userColour = '#FF0000';
const analysisResults = analyseData(input);
function optimisePerformance() { ... }
const errorMessage = 'Failed to recognise user credentials';

// INCORRECT - American English
const userColor = '#FF0000';
const analysisResults = analyzeData(input);
function optimizePerformance() { ... }
const errorMessage = 'Failed to recognize user credentials';
```

### Documentation Examples

```markdown
"This feature optimises the application's performance..."
"The system analyses user behaviour..."
"Configure your favourite colour scheme..."
```

## Punctuation

**Use hyphens, NOT em-dashes:**

```markdown
"This feature - which optimises performance - is optional"
"The system works in three stages - analysis, processing, and output"
```

Use single hyphens `-` with spaces around them for parenthetical statements, not em-dashes `—` or `--`.

## Checklist for New Features

When generating ANY text content (code, documentation, UI text):

1. **Check spelling**: Use British English variants (-ise, -our, -re, -ce)
2. **Review variables**: Ensure function/variable names use British spelling
3. **Verify messages**: All user-facing text must be British English
4. **Check punctuation**: Use hyphens with spaces, not em-dashes
5. **Update docs**: All documentation follows British conventions

**Exception:** External library names and third-party API terms should remain as-is (e.g., `color` in CSS properties, `Authorization` in HTTP headers).

## Search Commands

Always use `rg` (ripgrep) instead of traditional `grep` and `find` commands:

```bash
# Use rg instead of grep
rg "pattern"

# Use rg with file filtering instead of find
rg --files -g "*.py"
```
