---
name: skill-creator
description: Propose, then write, a project skill. Use when you notice a procedure worth reusing (done three times, explained twice, a fix that is really a recipe), and again when the owner says yes - `engine skill new <name> --approved-by <owner>`.
---

# skill-creator — Propose, then write, a project skill

## Purpose
A skill is a reusable instruction sheet that every chat on this project can load.
Use this sheet when you notice something worth turning into one, and again when
the owner says yes.

## When to propose a skill
Propose one when any of these is true:
- you have done the same procedure about three times (signing in to check a
  screen, re-running a scoring check, setting up test data);
- the owner has had to explain the same thing twice;
- a warning's fix is really a recipe ("do A, then B, never C").

Do **not** make the skill yet. Ask the owner first, in one line, with a draft:

> I've done X three times now. Should I make it a skill so the next chat just
> does it? Draft: <two or three lines of what it would say>.

- **Yes** → write it (below).
- **No** → record the refusal
  (`engine record decision "No skill for X: <the owner's reason>" --person <owner>`)
  and do not ask again for the same thing.

## Where it goes
- **Project skill** (this product only): the product's knowledge store,
  `skills/<name>/`. This is the default. Every engine and machine on the product
  shares it, and a project skill of the same name as a shipped one wins.
- **Shipped skill** (every product): the engine's own `skills/<name>/`, copied
  into each product's `.claude/skills/` on install. Only the owner promotes a
  project skill to shipped.

The library is flat: one folder per skill, no category folders.

## Write it
1. **Name:** lowercase and hyphenated, saying what it does (`sign-in-headless`,
   not `helper`). Unique within the project.
2. **Make it**, with the owner's name (the product's owner, when one is set):
   ```bash
   engine skill new sign-in-headless --description "One line: what it does and exactly when to load it" --approved-by <owner> [--load-class reference]
   ```
   It is refused without `--approved-by`, or when the name is not the owner's.
   It writes `skill.yaml` (with `approved_by`, `approved_on`, `proposed_by`) and
   a `SKILL.md` to fill in, and re-indexes.

   Load classes:
   - `bootstrap`: loaded by every chat, every session. Use it rarely, because
     each one costs reading in every chat.
   - `phase-scoped`: only during one phase of work.
   - `conditional`: only when its trigger happens (an audit, a screen change).
   - `reference`: installed but never loaded on its own; a chat looks it up. This
     is the default.
3. **`SKILL.md`:** keep the frontmatter (`name`, `description`; the description
   says when to load it). Below it: `## Purpose` (the problem it solves, and when
   to load it), `## Steps` (directive, numbered, with exact commands), and
   optionally `## Don't` (what goes wrong, and why).
   - Write "Do X", not "X is recommended".
   - Cut every line that doesn't change what the agent does.
4. **Check it:** `engine skill index`, then `engine skill get <name>` to see it loads.

## Don't
- Don't make a skill without the owner's yes.
- Don't copy a general skill in from elsewhere. If Claude already has it built in
  (Word, PDF, slides), it does not belong here.
- Don't mark a skill `bootstrap` unless every chat genuinely needs it.
