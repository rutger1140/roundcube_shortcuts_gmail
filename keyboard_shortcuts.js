/**
 * Gmail-style keyboard shortcuts for Roundcube.
 * Bindings mirror the default Gmail shortcuts only — anything not listed below
 * is intentionally NOT bound (no accidental deletes etc).
 *
 * Common (list + show):
 *   c          compose
 *   r          reply
 *   a          reply-all
 *   f          forward
 *   s          toggle star (flagged)
 *   e          archive
 *   !          mark as spam
 *   #          delete
 *   Shift+I    mark as read
 *   Shift+U    mark as unread
 *   g <key>    chord prefix
 *
 * List view only:
 *   j          next (older) message in list — moves cursor down
 *   k          previous (newer) message — moves cursor up
 *   x          toggle selection on focused row
 *   o / Enter  open focused message
 *
 * Show / preview view only:
 *   j          next message
 *   k          previous message
 *   u          back to message list
 *
 * Chord (after pressing g, within 1.5 s):
 *   g n        next page
 *   g p        previous page
 *   g i        Inbox
 *   g t        Sent
 *   g d        Drafts
 *
 * Compose view:
 *   Ctrl+Enter send
 */
$(function () {
  // detect whether we're inside the preview/show iframe — only build the
  // help dialog in the top window so `?` doesn't open it twice in different
  // documents.
  var in_iframe = false;
  try { in_iframe = window.self !== window.top; } catch (_) { in_iframe = true; }

  function open_help() {
    try {
      if (in_iframe && window.top && typeof window.top._ks_open_help === 'function') {
        window.top._ks_open_help();
        return;
      }
    } catch (_) {}
    var $d = $('#ks_help');
    if ($d.length) $d.dialog('open');
  }

  // build & register the help dialog
  var help_rows = [
    ['Common', [
      ['c',         'Compose'],
      ['r',         'Reply'],
      ['a',         'Reply all'],
      ['f',         'Forward'],
      ['s',         'Toggle star'],
      ['e',         'Archive'],
      ['v',         'Move to folder…'],
      ['!',         'Mark as spam'],
      ['#',         'Delete'],
      ['Shift+I',   'Mark as read'],
      ['Shift+U',   'Mark as unread'],
      ['/',         'Focus search'],
      ['?',         'Show this help'],
    ]],
    ['Message list', [
      ['j',         'Next (older)'],
      ['k',         'Previous (newer)'],
      ['x',         'Toggle selection'],
      ['o / Enter', 'Open message'],
      ['* a',       'Select all'],
      ['* n',       'Select none'],
      ['* r',       'Select read'],
      ['* u',       'Select unread'],
      ['* s',       'Select starred'],
      ['* t',       'Select unstarred'],
    ]],
    ['Message view', [
      ['j',         'Next message'],
      ['k',         'Previous message'],
      ['u',         'Back to list'],
    ]],
    ['Navigation (g then …)', [
      ['g n',       'Next page'],
      ['g p',       'Previous page'],
      ['g i',       'Inbox'],
      ['g t',       'Sent'],
      ['g d',       'Drafts'],
    ]],
    ['Compose', [
      ['Ctrl+Enter', 'Send'],
      ['Ctrl+S',     'Save draft'],
    ]],
  ];

  if (!in_iframe) {
    var html = '<div id="ks_help" title="Keyboard shortcuts" style="display:none">'
      + '<div style="column-count:2;column-gap:28px;column-fill:balance">';
    help_rows.forEach(function (section) {
      html += '<div style="break-inside:avoid;-webkit-column-break-inside:avoid;page-break-inside:avoid;margin-bottom:1em">';
      html += '<h4 style="margin:0 0 .3em">' + section[0] + '</h4>';
      html += '<table style="border-collapse:collapse;width:100%">';
      section[1].forEach(function (row) {
        html += '<tr><th style="text-align:left;font-family:monospace;padding:2px 16px 2px 0;white-space:nowrap;vertical-align:top">'
          + row[0] + '</th><td style="padding:2px 0">' + row[1] + '</td></tr>';
      });
      html += '</table></div>';
    });
    html += '</div></div>';

    $(html).appendTo('body').dialog({
      autoOpen: false,
      modal: false,
      resizable: false,
      width: 680,
    });

    // expose opener so iframes can route ? to the top-window dialog
    window._ks_open_help = function () { $('#ks_help').dialog('open'); };
  }

  var chord_g = false;
  var chord_g_timer = null;
  var chord_star = false;
  var chord_star_timer = null;
  var focus_first_after_list = false;

  function set_chord_star() {
    chord_star = true;
    if (chord_star_timer) clearTimeout(chord_star_timer);
    chord_star_timer = setTimeout(function () { chord_star = false; chord_star_timer = null; }, 1500);
  }

  function consume_chord_star() {
    chord_star = false;
    if (chord_star_timer) { clearTimeout(chord_star_timer); chord_star_timer = null; }
  }

  function select_by_predicate(predicate) {
    var ml = rcmail.message_list;
    if (!ml) return;
    ml.clear_selection();
    for (var uid in ml.rows) {
      if (predicate(ml.rows[uid])) ml.select_row(uid, 1, false);
    }
  }

  function open_move_menu() {
    var anchor = rcmail.gui_objects.messagelist || document.body;
    var ev = $.Event('click', { target: anchor });
    rcmail.command('move', null, anchor, ev);
  }

  // when a g-chord triggers a folder/page change, focus the first row once
  // the new list has loaded so j/k navigation works immediately
  rcmail.addEventListener('listupdate', function () {
    if (!focus_first_after_list) return;
    focus_first_after_list = false;
    var ml = rcmail.message_list;
    if (ml && ml.select_first) ml.select_first();
  });

  function set_chord_g() {
    chord_g = true;
    if (chord_g_timer) clearTimeout(chord_g_timer);
    chord_g_timer = setTimeout(function () { chord_g = false; chord_g_timer = null; }, 1500);
  }

  function consume_chord_g() {
    chord_g = false;
    if (chord_g_timer) { clearTimeout(chord_g_timer); chord_g_timer = null; }
  }

  function toggle_flag() {
    var ml = rcmail.message_list;
    if (!ml) return;
    var sel = ml.get_selection();
    if (!sel.length) return;
    var row = ml.rows[sel[0]];
    rcmail.command('mark', row && row.flagged ? 'unflagged' : 'flagged');
  }

  function move_selection(direction) {
    var ml = rcmail.message_list;
    if (!ml) return;
    var uid = direction === 'next' ? ml.get_next() : ml.get_prev();
    if (uid) {
      ml.select_row(uid, false, false);
      ml.scrollto(uid);
    }
  }

  function toggle_select() {
    var ml = rcmail.message_list;
    if (!ml || !ml.last_selected) return;
    ml.select_row(ml.last_selected, 1, false); // CONTROL_KEY=1 toggles
  }

  function open_focused() {
    var ml = rcmail.message_list;
    var uid = ml && ml.last_selected;
    if (uid) rcmail.command('show', uid);
  }

  // Ctrl+S in compose saves draft (keydown needed to pre-empt browser's "Save Page")
  $(document).keydown(function (e) {
    if (rcmail.env.action == 'compose' && e.ctrlKey && !e.shiftKey && !e.altKey && (e.which === 83 || e.key === 's')) {
      rcmail.command('savedraft');
      e.preventDefault();
      return false;
    }
  });

  $(document).keypress(function (e) {
    // ignore keys while typing into form fields
    if ($("*:focus").is("textarea, input")) return true;

    var task = rcmail.env.task;
    var action = rcmail.env.action;

    // compose: Ctrl+Enter sends
    if (action == 'compose') {
      if (e.which == 13 && e.ctrlKey && $("*:focus").is("#composebody")) {
        rcmail.command('send');
        return false;
      }
      return true;
    }

    if (task == 'login') return true;
    if (e.ctrlKey || e.metaKey || e.altKey) return true;

    // resolve pending "* <key>" chord (bulk selection)
    if (chord_star) {
      consume_chord_star();
      if (action != '') return false;
      switch (e.which) {
        case 97:  rcmail.command('select-all', 'page');                       return false; // * a
        case 110: rcmail.command('select-none');                              return false; // * n
        case 114: select_by_predicate(function (r) { return !r.unread; });    return false; // * r
        case 117: rcmail.command('select-all', 'unread');                     return false; // * u
        case 115: rcmail.command('select-all', 'flagged');                    return false; // * s
        case 116: select_by_predicate(function (r) { return !r.flagged; });   return false; // * t
      }
      return false; // swallow unknown chord follow-ups
    }

    // resolve pending "g <key>" chord
    if (chord_g) {
      consume_chord_g();
      focus_first_after_list = true;
      switch (e.which) {
        case 110: rcmail.command('nextpage');      return false; // g n
        case 112: rcmail.command('previouspage');  return false; // g p
        case 105: rcmail.command('list', 'INBOX'); return false; // g i
        case 116: // g t — sent
          if (rcmail.env.ks_sent_mbox) rcmail.command('list', rcmail.env.ks_sent_mbox);
          return false;
        case 100: // g d — drafts
          if (rcmail.env.ks_drafts_mbox) rcmail.command('list', rcmail.env.ks_drafts_mbox);
          return false;
      }
      focus_first_after_list = false;
      return false; // swallow unrecognized chord follow-ups
    }

    // common keys (list + show)
    switch (e.which) {
      case 63:  open_help();                            return false; // ?
      case 47:  // / — focus quicksearch
        var q = rcmail.gui_objects.qsearchbox || document.getElementById('rcmqsearchbox') || document.getElementById('quicksearchbox');
        if (q) { $(q).trigger('focus').trigger('select'); }
        return false;
      case 103: set_chord_g();                          return false; // g
      case 42:  set_chord_star();                       return false; // *
      case 118: open_move_menu();                       return false; // v
      case 99:  rcmail.command('compose');              return false; // c
      case 115: toggle_flag();                          return false; // s
      case 101: rcmail.command('plugin.archive');       return false; // e
      case 33:  rcmail.command('plugin.markasjunk.junk'); return false; // !
      case 35:  rcmail.command('delete');               return false; // #
      case 114: rcmail.command('reply');                return false; // r
      case 97:  rcmail.command('reply-all');            return false; // a
      case 102: rcmail.command('forward');              return false; // f
      case 73:  rcmail.command('mark', 'read');         return false; // Shift+I
      case 85:  rcmail.command('mark', 'unread');       return false; // Shift+U
    }

    // list-view-only
    if (action == '') {
      switch (e.which) {
        case 106: move_selection('next'); return false; // j
        case 107: move_selection('prev'); return false; // k
        case 120: toggle_select();        return false; // x
        case 111: // o
        case 13:  // Enter
          open_focused();
          return false;
      }
    }
    // show/preview-only
    else if (action == 'show' || action == 'preview') {
      switch (e.which) {
        case 106: rcmail.command('nextmessage');     return false; // j
        case 107: rcmail.command('previousmessage'); return false; // k
        case 117: rcmail.command('list');            return false; // u
      }
    }
  });
});
