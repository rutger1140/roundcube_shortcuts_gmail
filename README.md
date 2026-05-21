# keyboard_shortcuts

Gmail-style keyboard shortcuts for Roundcube. Originally written 14 years ago by
[corbosman](https://github.com/corbosman/keyboard_shortcuts), later picked up
and maintained by Gene Hawkins
([texxasrulez/keyboard_shortcuts](https://github.com/texxasrulez/keyboard_shortcuts));
this fork strips the help-launcher icon, jqueryui dialog skinning, localization,
and all non-Gmail bindings so the binding surface is tight and there are no
destructive shortcuts on bare single letters.

## Install

Clone into your Roundcube `plugins/` directory and enable in `config.inc.php`:

```
cd /path/to/roundcube/plugins
git clone https://github.com/<you>/keyboard_shortcuts.git
```

```php
$config['plugins'] = ['jqueryui', 'keyboard_shortcuts', /* ... */];
```

`jqueryui` is required (the `?` help dialog uses it).

## Shortcuts

### Common (list view + message view)

| Key       | Action |
|-----------|--------|
| `c`       | Compose |
| `r`       | Reply |
| `a`       | Reply all |
| `f`       | Forward |
| `s`       | Toggle star (flagged) |
| `e`       | Archive |
| `v`       | Move to folder (opens folder picker) |
| `!`       | Mark as spam (markasjunk) |
| `#`       | Delete |
| `Shift+I` | Mark as read |
| `Shift+U` | Mark as unread |
| `/`       | Focus quicksearch |
| `?`       | Show shortcut help |

### Message list only

| Key         | Action |
|-------------|--------|
| `j`         | Next (older) — move selection down |
| `k`         | Previous (newer) — move selection up |
| `x`         | Toggle selection on focused row |
| `o` / Enter | Open focused message |
| `* a`       | Select all visible |
| `* n`       | Select none |
| `* r`       | Select read |
| `* u`       | Select unread |
| `* s`       | Select starred |
| `* t`       | Select unstarred |

### Message view / preview only

| Key | Action |
|-----|--------|
| `j` | Next message |
| `k` | Previous message |
| `u` | Back to message list |

### Navigation chord (`g` then …, within 1.5 s)

| Chord | Action |
|-------|--------|
| `g n` | Next page |
| `g p` | Previous page |
| `g i` | Inbox |
| `g t` | Sent |
| `g d` | Drafts |

After a chord folder/page change, the first message in the new list is
auto-selected so `j`/`k` work immediately.

### Compose view

| Key          | Action |
|--------------|--------|
| `Ctrl+Enter` | Send |
| `Ctrl+S`     | Save draft (pre-empts browser "Save Page") |

## Notes

- Shortcuts are ignored while focus is in a `<textarea>` or `<input>` so they
  never interfere with typing.
- The help dialog (`?`) is only constructed in the top window; preview iframe
  presses route up to the parent so it doesn't open twice.
- `Sent` / `Drafts` targets come from Roundcube's `sent_mbox` / `drafts_mbox`
  config and are exposed to JS as `rcmail.env.ks_sent_mbox` /
  `rcmail.env.ks_drafts_mbox` by `keyboard_shortcuts.php`.

## License

GPL-2.0-only (inherited from the original plugin).
