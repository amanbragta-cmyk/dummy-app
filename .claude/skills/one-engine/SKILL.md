---
name: one-engine
description: How to work inside a product run by the One Engine. Use at the start of any task in a repo with a .engine.json, when planning a build, when you decide or learn something worth keeping, when the plan is unclear or does not hold, when you are about to commit, or when the work turns out to need a different kind of engine.
---

# Working inside the One Engine

This product's knowledge is shared by every engine that works on it: Factory
(prototypes), AutoDev (clear tickets) and live chats like this one. You read it
and write it through one door. Never keep knowledge in a file of your own.

## Read
- Your briefing arrived at the start of the session. When you open a file, the
  warnings and lessons about it are shown to you once.
- Ask for more with the `knowledge_query` tool, or `engine query --files <path>`.
- A line marked "may be out of date" was true for older code. Check it, then
  `knowledge_recheck` it if it still holds, or record what replaces it.

## Route every request first
Before you change anything, `engine work "<the request>"`. It says which of 11 kinds
of work it is, how risky, and the path, with the words each guess came from:
- **Changes no file** (a question): no ticket. Answer from the code and the notes.
- **Tiny** (a typo, a label, a colour, docs, a test): the quick lane, no ticket.
  Commit it on a work branch: at most 3 files and no risky file, or the commit is
  refused and it becomes a ticket. Someone else reviews it after (`engine quick`).
- **Everything else is a ticket** of the team's process (`process/sdlc.json`):
  `engine ticket new "<the request>"` takes the type from the route (story, task,
  bug, hotfix, prototype, investigation, decision, data, infra) and refuses until
  the ticket has what that type needs: story points (1, 2, 3, 5, 8; a 13 must be
  split), `--accept` lines (what QA will test), a check for a bug, a severity (P1
  to P4) for a hotfix. Ask the person for what is missing, one plain question at a
  time with your recommendation; never invent acceptance criteria or points.
- **Risky** (money, sign-in, customer data, the database): the owner signs off
  before it closes, whatever the kind.
- **Live data, servers, settings, investigations, decisions** close on steps signed
  by the right person, in order (`engine step <KEY>` lists them). The engine never
  touches live data or servers; you prepare, a person approves, then it runs.
- A request that mixes kinds ("add the export and tidy the code") is split: route
  each part on its own. The guess is wrong? `--kind <kind>` and say why.
- **A bigger build** (a new product, or a request that names several parts: "10
  topics", "home, quiz and progress"): a plan (below) with **one ticket per part**,
  never one ticket for everything. Each ticket has `type:`, `points:`, a `check:`
  (the product's test command, when it has one) and one indented `accept:` line per
  thing QA will test. Loading gives each a key (SC-12). Points are the person's: ask
  them; points you set yourself show as proposed until they confirm.
- **Where everything is**: `engine ticket board`: Backlog, Dev, Code Review, QA,
  Ready, Deployed. Stages are worked out from what happened; nobody moves a card.
- **A change while a plan runs** goes to the backlog; only the owner or an
  approver pulls it in, swapping out a ticket of no fewer points.

## Plan before building
Any build bigger than one task gets a plan first, written with the person, in
the shape of `templates/plan.md` in the engine (title, Done means, Decisions,
Joins, Tasks with days, needs, files, rests on). Rules for a good plan:
- **Agree the joins first**: what passes between pieces (fields, an API shape,
  a table). Pieces that share a join can then be built at the same time.
- **Cut where pieces don't touch**: two tasks that can run at the same time
  never list the same file. If they must, one `needs` the other.
- **Ordered chains go to one person**: a chain of small tasks that must run in
  order is one task, not five people waiting on each other.
- Every decision names who made it. A decision the person made, written by you,
  waits on their page as proposed until they confirm it.

`engine plan load <file> --by <person>` checks it and prints the lanes and the
critical path. Show the person that output; the delivery estimate and the
critical path are theirs to agree.

## Working from the plan
- **Build each wave with helpers, at the same time.** Tasks whose `needs` are done
  form a wave (`engine plan waves`). When a wave has two or more, lead it: start one
  helper per task, all in one message (Agent tool, `isolation: "worktree"`), each
  given only `engine plan brief <T>`. A helper's last line `BRANCH: <b>` ->
  `engine plan accept <T> --branch <b>`; `QUESTION: ...` -> `plan_ask` on that task.
  Then the next wave. Build one task yourself only when it is the only one ready.
- **Claim before you start**: `plan_claim` (or `engine plan claim T3`). It is
  announced to everyone. If it is refused, someone holds it or its files: pick
  another task from `plan_show`, the critical ones (marked !) first.
- **Unclear, or the plan does not hold? Ask, don't work around it**:
  `plan_ask` with the task, decision (D1) or join (J1) it is about. It freezes
  only what depends on it. Tell the person; carry on with other work. Never
  answer your own question: only a person settles it.
- **A bug found while building a plan** (by QA, a review, a whole-product check) goes
  into that plan, never a plan of its own: `engine ticket new "<bug>" --type bug --points N
  --accept ".." --files <the files you will change> --check ".." --into <plan>`. Name the
  files yourself; never ask the owner which files. A bug already filed as its own plan:
  `engine ticket pull <KEY> --into <plan>`. Its fix then lands like any ticket, and the
  release waits for it. One already fixed and closed in its own plan comes with its fix:
  then `engine plan land <plan>` puts it on the plan's branch, checked with the whole plan.
- **RE-CHECK** in your briefing means a decision changed under your task: check
  your work against the new one, then claim the task again to clear it.
- **Done is not your word.** A ticket closes (Ready) only when every gate lets it:
  1. Work on the ticket's own branch, the `Branch:` line of its brief
     (`engine ticket show <KEY>`): `feature/SC-12-<words>`, `fix/` for a bug,
     `hotfix/` from main for a hotfix. Every commit names the key (the commit hook
     adds `Task: SC-12`). A new test is shown failing first (`engine lock <plan>:<T>`).
  2. The task's knowledge page covers each area you changed (the gate names the command).
  3. A screen task: load `frontend-design` before the first edit, then
     `engine journey prove <T>`: a real browser, screenshots at 390, 820 and 1280 wide.
  4. Someone who did not build it reviews it: `engine review brief <T> --out brief.md`,
     then start the `engine-reviewer` helper with that brief. The engine records its
     verdict itself when it finishes; nobody types a verdict.
  5. QA, for a story, bug or hotfix: `engine qa brief <KEY> --out qa.md`, then start
     the `engine-qa` helper with that brief. It tests every acceptance criterion and
     the engine records its verdict; a failed QA comes back as bugs to fix.
  6. A P1 hotfix also needs its root cause: `engine rca <KEY> --cause .. --fix .. --prevention ..`.
     A ticket with close steps (live data, servers, an investigation, a decision, a
     risky ticket) needs each signed in order: `engine step <KEY> <step> --note ".."`;
     an owner or lead step is theirs to sign, from their own terminal or the owner page.
  7. `engine plan done <T>` from the ticket's branch (or, for a helper's branch,
     `engine plan accept <T> --branch <its branch>`): the referee checks it in a
     clean copy and runs every gate. Each refusal says exactly what is missing.
     A commit made before the ticket's branch existed is tied to it with
     `engine link <KEY> <commit>`; never rewrite history (no rebase, no amend of
     pushed or earlier work) to satisfy a gate.
  8. Going out is the plan's `kind: release` task, the weekly checklist:
     `engine release status <plan>` says what is left. The owner accepts it (UAT) and
     a lead confirms the backup, each from their own terminal; then
     `engine release tag <plan>` writes the tag, the notes and the rollback; deploy;
     close the release task. Its tickets are then Deployed. A release that breaks is
     undone by a lead: `engine release undo <plan> --why ".."` names the rollback point.
  Never merge a task's branch by hand, never write your own script around these
  steps, never set ENGINE_PERSON or ENGINE_OWNER: inside a chat they are ignored and
  logged. A task closed by mistake is reopened by a lead or the owner
  (`engine plan reopen <T> --why "..."`).

## End to end
When the owner says to build it end to end, record their words:
`engine go <plan> --end-to-end --said "<what they said>"`. Then keep building to the
release without stopping:
- **Content checks** the plan stopped for (screens, wording) are gathered for one
  review at the end: `engine go` lists what is left and what to show them.
- **A small question** (a name, a test approach, a small layout fix, the order of
  work; it can be undone and fits the plan): `engine decider "<question>" --task <T>`
  and start the `engine-decider` helper as it says. Its answer is recorded for the
  owner to confirm or overturn; act on it.
- **A locked test that must change**: keep every test it had and change it; the reviewer
  is told to compare it with the locked one, and the owner may overturn it later. Never
  ask the owner to approve it. Only a test you must delete still needs their approval.
- **A question only the owner can answer**: `plan_ask` on that ticket. Only that
  ticket waits; carry on with the others. Never wait on what the plan does not say a
  task needs. While anything is ready or claimed, the engine refuses your stop once.
- **Stop only for**: a push, a merge into main, a new package, money, live data, and
  the release sign-off.
- A long chat: save `engine note "..."` at a safe moment and keep working. Mention
  /compact once if the owner is there; never wait for it.

## Write, as you go
Use `knowledge_write` (or `engine record <type> "<text>" ...`):
- **decision**: a choice you made, with the reason. A choice the owner made:
  `engine record decision "<it>" --for <owner>`: it is theirs once they confirm it.
- **warning**: a trap in the code, with the files.
- **lesson**: what a miss taught, as a rule that would have caught it.
- **rule**: how the product must behave.
- **difference**: how one client's version differs from main.
- **handover**: where the work stands when you stop or pass it on.

The first line is the title. Keep it plain: what, where, why.

## Before you commit
- Work on a branch. The guard refuses commits on main.
- A change on a trust boundary needs the `security-audit` skill in guidance
  mode and `engine security reviewed <file>... --checked "<what you checked>"`.

## Skills
Load the always-on skills every session (`engine skill list --always-on`):
this one, `security-audit`, `find-your-way` and `git-ground-rules`. Load the
others when their moment comes: `engine skill get <name>` or the `skill_get`
tool. A new project skill is proposed to the owner first (`skill-creator`).

## Never the engine itself
The One Engine judges this product's work, so a chat here never changes it: not its
folder, its branches or its installed versions (the engine refuses such an edit). Found
an engine bug? `plan_ask` on the task it blocks, with what you saw. The engine is fixed
by its own maintenance and reaches this product as a tested version.

## When the work changes kind
If a clear piece could run unattended, say so: the person can route it to
AutoDev with `engine route <task> --mode maintain`. If production is broken,
a person opens the emergency path; you do not.
