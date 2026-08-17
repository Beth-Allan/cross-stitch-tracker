# The words you can type — Beth's card

One page, for Beth. Everything you can ask this project for, in the words that ask for it. Type
the word at the start of a message and the door opens — that is all a "door" is.

**You are never asked to edit a file, run a command, sort out a merge, or open GitHub.** Claude
does all of that. Your part is deciding, and your word in a conversation _is_ the decision — "yes",
"merge it", "do that one" is all the approval anything needs.

## You never have to remember what's next

Every session ends by telling you the one thing to type next. That running order lives in the
work log, and `/progress` will read it back to you any time you have lost the thread. If you want
a different order, say so — the queue is yours to reorder, in any session or at `/cleanup`.

## Your words

| Type this         | When                                                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/progress`       | "Where are we?" A short plain summary — what shipped, what's in flight, what's waiting on you. Changes nothing, ever.                                              |
| `/broken`         | Something is wrong: an error, a wrong number, behaviour you didn't expect. Describe it however you like.                                                           |
| `/tweak`          | You want something different — a preference, an improvement, a "could this be…". Not broken, just not right.                                                       |
| `/cleanup`        | Tidy-up time: the open questions, the decisions waiting on you, the list of small known problems. One decision at a time.                                          |
| `/stitch-fact`    | You want to tell it something true about cross-stitch — a skein length, what "kitted" means, how a fabric count works. **It also has questions saved up for you.** |
| `/design-session` | You want to look at how the app _looks_ and react to options. Your favourite becomes the standard the app is then rebuilt to.                                      |
| `/plan-feature`   | You want something new planned out properly before anyone builds it.                                                                                               |
| `/walkthrough`    | A chunk of work is finished and you want to be shown what it does, in plain language, before you sign it off.                                                      |

Three more words come from the queue rather than from you — you'll be told to type them:
`/work-item` (build the next planned piece), `/review` (a second pair of eyes on something
delicate), `/stage-review` (check a whole finished chunk before your walkthrough).

There is **no `/deploy`**. When a piece of work is approved and merged, it is live on the real
site within a minute or two. That is why you get shown a preview link before anything you look at
changes.

## What you can expect back

- **Plain language.** What happened, what it means for you, what happens next. If a technical
  word is unavoidable it gets translated.
- **Cause before fix.** When something broke, you get told _why_ before you get told what changed.
- **Questions are decisions, never homework.** Each one arrives as: what happened · why it needs
  you · your options, with a recommendation · what happens after you choose. One at a time.
- **"I don't know" instead of a guess.** Anything about cross-stitch that isn't already written
  down gets asked, never assumed — that rule exists because guessing has cost real work before.
- **A wrong door is redirected, not refused.** If you report something as broken and it turns out
  to be a wish, you'll be told kindly and it gets filed in the right place anyway.

## If you ever want the detail

You don't need it — but it exists: `docs/process/session-protocol.md` is the full rulebook every
session follows, and `docs/process/work-log.md` is the running record of everything built. Both
are written for Claude, not for you.
