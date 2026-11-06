---
name: parallel-sprint
description: Lead a plan whose tasks can run at the same time - find what is ready, start one helper per task in its own worktree, check what each brings back, and batch the owner's questions. Use when the owner says to build a plan with independent tasks, before starting any helper.
---

# parallel-sprint — Lead a plan with helpers

## Purpose
A big plan often holds tasks that do not depend on each other: tests for six
screens, six adapters, six report pages. The owner talks to you, the lead. You
start one helper per independent task, each in its own copy of the project,
and you check what each one brings back before it lands. The owner never opens
extra chats.

Worth it for big plans only: every helper reads its own context, so the cost
grows with the number of helpers. Two small tasks are faster done by you, one
after the other.

## Steps

1. **Tasks.** The plan is the engine's plan (`templates/plan.md`): each task
   lists the files it owns, its `needs`, and the check that proves it. If the
   work has no plan yet, write one with the owner and load it:
   ```bash
   engine plan load <plan.md> --by <owner>
   ```
   The engine refuses two tasks that could run at once and list the same file.
   Make one `needs` the other, or split the files.

2. **What can run now.** `engine plan ready` (or `plan_show`) lists the tasks
   anyone may start, the critical ones first; `engine plan show` gives the lanes
   and the critical path.

3. **Start them, all at once.** Claim each task for the helper
   (`engine plan claim T3 --by <helper>`), then start one helper per task (in
   Claude Code: the Agent tool, `isolation: "worktree"`, all in one message so
   they run in parallel). The engine has no command that writes a helper's
   brief, so write it yourself and give it nothing else: the task's line from
   the plan (what, files, check), the decisions and joins it rests on, and
   `engine brief live --files <its files>` for the warnings and lessons on those
   files. Tell it to end with `BRANCH: <name>` or `QUESTION: <question>`.

4. **Check each report.** The engine has no referee command for a returned
   branch, so check it yourself:
   - only the task's files changed (`git diff --stat <base>...<branch>`);
   - the task's check passes on the branch;
   - it merges cleanly onto your holding branch.

   Accepted → merge it onto the holding branch (never `main`), then
   `engine plan done T3`. Refused → send the same helper back once with the
   reason, or do the fix yourself. Never widen a task's files to make it pass.

5. **Questions.** A helper that ends with `QUESTION: ...` stopped for the owner:
   `engine plan ask "<the question>" --on T3`. It freezes only that task and what
   waits on it. Carry on with the others; when the owner answers
   (`engine plan answer`), resume that task with the answer.

6. **Next round.** Back to step 2 until every task is done.

7. **Finish.** Tell the owner what is on the holding branch and what was
   refused, in a few lines. Merging the holding branch is the owner's call.

## Don't
- Don't start a helper without its brief, or with more than its brief.
- Don't let a helper push, merge or touch `main`. You merge, onto the holding
  branch only.
- Don't start a task whose `needs` are not done.
- Don't answer a helper's QUESTION yourself unless the owner's written decisions
  already settle it; then say which decision settles it when you resume it.
