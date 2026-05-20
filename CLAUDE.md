# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Roundcube plugin: Gmail-style keyboard shortcuts. Fork of
[texxasrulez/keyboard_shortcuts](https://github.com/texxasrulez/keyboard_shortcuts)
stripped to Gmail-only bindings (no destructive single-letter keys, no
help-launcher icon, no jqueryui dialog skinning, no localization). See
`README.md` for the full keybinding table — don't duplicate it here.

## Architecture

Two-file plugin, no build step:

- `keyboard_shortcuts.php` — Roundcube plugin shim. Registers for `mail` and
  `compose` tasks, bails early on login / new-user-dialog, requires
  `jqueryui`, includes the JS, and exposes `sent_mbox` / `drafts_mbox` to JS
  as `rcmail.env.ks_sent_mbox` / `rcmail.env.ks_drafts_mbox`. **All
  keybinding logic lives in JS** — the PHP file only bootstraps.
- `keyboard_shortcuts.js` — single `$(function(){…})` that registers a
  `keydown` handler (for Ctrl+S, which must pre-empt the browser's "Save
  Page") and a `keypress` handler (everything else). Branches on
  `rcmail.env.action`: `''` = list view, `show`/`preview` = message view,
  `compose` = compose view.

### Chord state machine

Two chords share the same pattern: a flag + 1.5s timer.

- `g <key>` → folder/page nav (`g i`, `g t`, `g d`, `g n`, `g p`).
- `* <key>` → bulk selection (`* a`, `* n`, `* r`, `* u`, `* s`, `* t`).

After a `g`-chord folder/page change, `focus_first_after_list` makes the
`listupdate` event handler auto-select the first row so `j`/`k` work
immediately in the new list.

### Iframe duplication (important)

Roundcube's Elastic skin renders the message preview in a same-origin iframe
with its own `rcmail`. This plugin's JS runs in **both** the parent and the
iframe. To avoid double-construction of the help dialog:

- `in_iframe` is detected via `window.self !== window.top`.
- The `?` help dialog is only built in the top window.
- The top window exposes `window._ks_open_help`; iframe presses of `?` route
  up to call it.

Any new global UI (dialogs, toasts) must follow this pattern.

### Input-field guard

Both handlers early-return when focus is in a `textarea`/`input` so shortcuts
never fire while typing. Compose's `Ctrl+Enter` (send) explicitly requires
focus to be `#composebody`.

### Bundled-plugin name collision (do not rename)

Roundcube's official Docker image ships an `autologon` plugin and runs
`bin/installto.sh` + `composer install` on every container start. If a
custom plugin directory's name collides with a bundled one, those scripts
overwrite the custom source through any bind mount. `keyboard_shortcuts` is
**not** a bundled plugin name, so it's safe — but don't rename it to
something that is. Check with `ls /usr/src/roundcubemail/plugins/` inside
the official image before renaming.

## Dev workflow

No tests, no build, no lint. Changes are validated by exercising the
shortcuts in a browser against a running Roundcube. When the plugin is
bind-mounted into a Roundcube container, JS/CSS/PHP changes are picked up
live — a browser hard-refresh (Ctrl+Shift+R) is enough, no container
restart needed. Roundcube ships with opcache off, so PHP edits don't need a
reload either.
