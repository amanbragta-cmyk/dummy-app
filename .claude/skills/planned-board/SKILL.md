---
name: planned-board
description: Work one task from the engine's plan - find one, claim it, build only in the files it lists, close it on its check, and ask when it does not hold. Use before any `engine plan claim` or `plan_claim`.
---

# planned-board — A task from the plan

## Purpose
A plan is cut into tasks, each listing the files it owns, what it needs first,
and the check that proves it. The plan hands the tasks out one person at a time
and is the one place every engine and chat sees who holds what. (In Anthill
this was the job board; in the engine it is the plan.) Load this before you
claim a task.

## Steps

**1. Is a task already yours?**

```bash
engine plan show        # or the plan_show tool: lanes, who holds what, open questions
```

- A task held by you → that is yours. Re-read its line in the plan (files,
  check, what it rests on) before touching any code.
- A task marked **RE-CHECK** → a decision changed under it: check your work
  against the new one, then claim it again to clear the mark.
- Nothing yours → `engine plan ready` lists what anyone may pick now, the
  critical ones (marked !) first. Nothing ready → there is no task for you. Say so.

**2. Claim, build, prove, close.**

```bash
engine plan claim T3      # or plan_claim; announced to everyone
#   build inside the task's files and nowhere else
#   run the task's check yourself before closing
engine plan done T3       # or plan_done; says what it opened up
```

A refused claim means someone holds the task or one of its files: pick another.

**3. Reading the result.** Anthill's gate had numbered exit codes for each kind
of refusal; the engine has no gate command. `engine plan done` closes the task
and, where the task has a check, refuses when it fails and names the test that
newly fails. Read the refusal and fix the work. If the fix is in a file the task
does not list, that is not yours: ask (step 4).

**4. Stuck, or the plan does not hold?**

```bash
engine plan ask "<what stopped you>" --on T3     # or plan_ask
```

It freezes only that task and what waits on it. Tell the person, then stop
or carry on with other work. Only a person answers (`engine plan answer`);
never answer your own question. Giving a task back without finishing it:
`engine plan release T3`.

## Don't
- Don't edit the plan's records in the knowledge store by hand: state edited
  directly is indistinguishable from tampering and records nobody's decision.
- Don't widen a task's files to fix something next to it.
- A command that seems missing is a real answer: say so and ask. Don't invent a
  workaround.
