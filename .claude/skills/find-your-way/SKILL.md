---
name: find-your-way
description: Starting cold in this codebase, or in a part of it. Use at the start of any task before reading the tree - `engine orient` for the whole picture, then `engine start "<task>"` for where the task lives, the line to read, what a change reaches, and the tests that prove it. Both only read.
---

# find-your-way — Starting cold in this codebase

## Purpose

Loaded every session. You know nothing about this repository yet; these two
commands give you the picture and the place, faster than reading the tree.
Neither changes anything.

## The two commands

```bash
engine orient                                  # the codebase on one page
engine start "<the task, in your own words>"   # where that task lives
```

- `orient` — what the product is, its areas and what each does, how they
  connect, what changed recently, the owner's words for things, how to prove
  a change, and the rules.
- `start` — a card: the file, `look_here_first` (the lines that match your
  task), `if_you_change_this` (who uses it, the tests that name it, and a
  warning when no test covers it), and the written rules about it.

## How to use the card

The card says where to start, not where it ends. The top candidate is right
about half the time, and the right file is in the top three about three times
in four. So:

1. Read the live code at `look_here_first`.
2. If it is not the deciding line, check the other candidates
   (`engine card <node_id> --goal "<task>"`) or follow `possible_routes` and
   `direct_consumers`.
3. Grep freely. The map is a head start, not a fence.
4. Before you change anything, read `if_you_change_this` (or
   `engine impact <file>`), and run the tests it names.

## When the words do not match

The owner says "Home", the code says `Chains`. The product's glossary, kept in
its knowledge store with the area pages, maps one to the other, and `start`
uses it. If you learn a new pairing, add it to the glossary through the
knowledge door; never keep it in a file of your own.
