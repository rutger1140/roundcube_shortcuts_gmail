<?php
declare(strict_types=1);

/**
 * keyboard_shortcuts — Gmail-style keybindings for Roundcube.
 *
 * See keyboard_shortcuts.js for the full binding list. Forked down from
 * texxasrulez/keyboard_shortcuts; the help dialog and non-Gmail bindings
 * were stripped to keep the binding surface tight.
 */
class keyboard_shortcuts extends rcube_plugin
{
    public $task = 'mail|compose';

    public function init(): void
    {
        $rcmail = rcmail::get_instance();

        if (!$rcmail->get_user_id() || $rcmail->task === 'login') {
            return;
        }

        // don't activate while the new-user dialog is in front
        $new_user_dialog = null;
        if ($rcmail->session && method_exists($rcmail->session, 'get')) {
            $new_user_dialog = $rcmail->session->get('plugin.newuserdialog');
        } elseif (isset($_SESSION['plugin.newuserdialog'])) {
            $new_user_dialog = $_SESSION['plugin.newuserdialog'];
        }
        if ($new_user_dialog) {
            return;
        }

        $this->require_plugin('jqueryui');
        $this->include_script('keyboard_shortcuts.js');

        $rcmail->output->set_env('ks_sent_mbox', (string) $rcmail->config->get('sent_mbox'));
        $rcmail->output->set_env('ks_drafts_mbox', (string) $rcmail->config->get('drafts_mbox'));
    }
}
