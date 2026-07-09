# Super RPG Bros — Safe GitHub Workflow (for 2 people)

These `.bat` files let you and your friend work on the game together **without overwriting each other's work**. You never have to type Git commands — just double-click the file you need.

## The golden rule

> **GET LATEST before you start. SAVE AND UPLOAD when you're done.**

If you both always do this, you'll almost never run into trouble.

---

## One-time setup

**Only ONE of you does this — the person who has the game folder.**

1. Install Git for Windows if you haven't: https://git-scm.com/download/win
2. Go to GitHub.com and create a **new, empty** repository (do **not** add a README or .gitignore — leave it blank).
3. Copy its web address (ends in `.git`).
4. Put all these `.bat` files inside your game folder.
5. Double-click **`0_FIRST_TIME_SETUP.bat`** and paste the address when asked.

Your game is now on GitHub. 🎉

**The other friend** does *not* run the setup file. Instead they get their own copy once:
- Install Git, then create an empty folder for the game.
- Open that folder, right-click → **Open in Terminal** (or "Git Bash Here").
- Type: `git clone <the same GitHub address> .` (the dot at the end matters — it clones into the current folder).
- Copy the `.bat` files into that folder too. Done — from now on you both use the numbered files.

---

## Everyday use

| File | When to use it | What it does |
|------|----------------|--------------|
| **1_GET_LATEST** | **Before** you start working | Downloads whatever your friend uploaded. |
| **2_SAVE_AND_UPLOAD** | **When you finish** a chunk of work | Saves your work and uploads it — but first checks if your friend uploaded something, and stops you if so. |
| **3_CHECK_STATUS** | Anytime you're unsure | Read-only. Shows unsaved work, who's ahead/behind, and recent uploads. Changes nothing. |
| **4_UNDO_LAST_UPLOAD** | You uploaded something broken | Safely reverses the most recent upload without deleting history. |

### A normal session looks like this
1. Double-click **`1_GET_LATEST`** ← start with the newest version.
2. Work on the game in your editor.
3. Double-click **`2_SAVE_AND_UPLOAD`**, type a short note like *"added enemy AI"*, done.

---

## The safety features (why this is hard to mess up)

- **SAVE_AND_UPLOAD checks first.** Before uploading, it looks at GitHub. If your friend uploaded while you were working, it **stops** and tells you to run `1_GET_LATEST` first. This is the main thing that prevents you from wiping out their work.
- **GET_LATEST warns about unsaved work** so you don't accidentally lose changes when downloading.
- **UNDO uses a safe "revert"** — it makes a *new* change that cancels the old one instead of deleting history, so it never breaks your friend's copy. Your old work stays recoverable.
- **CHECK_STATUS is read-only** — run it as much as you like; it can't hurt anything.

---

## Two tips to avoid the one thing that *can* get messy

1. **Don't both edit the exact same file at the exact same time.** Split the work (e.g. one does levels, one does characters). If you must share a file, tell each other and take turns.
2. **Upload often, in small chunks.** Small, frequent uploads are much easier to merge than one giant one.

## If something says "conflict"
That means you both changed the same lines of the same file. Don't panic and don't force anything — run **`3_CHECK_STATUS`**, and if you're unsure, ask for help before saving over it. Nothing is lost; it just needs a human to decide which version to keep.

---

*Branch used: `main`. If your repo uses a different branch name, open each `.bat` in Notepad and change the line `set BRANCH=main` near the top.*
