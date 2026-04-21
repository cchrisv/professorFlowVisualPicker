const STANDARD = [
    'account', 'activations', 'activity', 'address', 'announcement', 'answer_public',
    'answer_best', 'apps', 'apps_admin', 'approval', 'article', 'asset_action',
    'asset_object', 'asset_relationship', 'assigned_resource', 'assignment', 'avatar',
    'branch_merge', 'bundle_config', 'business_hours', 'calibration', 'call',
    'call_history', 'campaign', 'campaign_members', 'canvas', 'carousel', 'case',
    'case_change_status', 'case_comment', 'case_email', 'case_log_a_call', 'case_milestone',
    'case_transcript', 'case_wrap_up', 'cms', 'coaching', 'code_playground', 'collection',
    'connected_apps', 'contact', 'contact_list', 'contact_request', 'contract',
    'contract_line_item', 'currency', 'custom', 'custom_notification', 'customers',
    'dashboard', 'data_streams', 'date_input', 'date_time', 'decision', 'default',
    'document', 'drafts', 'education', 'email', 'email_chatter', 'empty', 'employee',
    'entitlement', 'entitlement_process', 'entitlement_policy', 'entitlement_template',
    'entity', 'entity_milestone', 'event', 'events', 'expense', 'feed', 'feedback',
    'file', 'filter', 'flow', 'folder', 'forecasts', 'form', 'formula', 'generic_loading',
    'goals', 'group', 'group_loading', 'hierarchy', 'high_velocity_sales', 'home',
    'household', 'household_relationship', 'identifier', 'image', 'incident', 'individual',
    'insights', 'investment_account', 'invocable_action', 'iot_orchestrations', 'knowledge',
    'lead', 'lead_insights', 'lead_list', 'link', 'list_email', 'live_chat',
    'live_chat_visitor', 'location', 'macros', 'maintenance_asset', 'maintenance_plan',
    'marketing_actions', 'medication', 'merge', 'messaging_conversation', 'messaging_session',
    'messaging_user', 'metrics', 'multi_picklist', 'multi_select_checkbox', 'news',
    'note', 'number_input', 'offer', 'opportunity', 'opportunity_contact_role',
    'opportunity_splits', 'orders', 'outcome', 'partner_fund_allocation', 'partners',
    'password', 'people', 'performance', 'person_account', 'person_name', 'picklist_choice',
    'podcast_webinar', 'poll', 'portal', 'portal_roles', 'post', 'price_book_entries',
    'pricebook', 'problem', 'procedure', 'process', 'product', 'promotions',
    'question_best', 'question_feed', 'queue', 'quick_text', 'quip', 'quotes', 'radio_button',
    'read_receipts', 'recent', 'record', 'recurring_appointment', 'related_list',
    'relationship', 'reply_text', 'report', 'resource_absence', 'resource_capacity',
    'restriction_policy', 'return_order', 'reward', 'sales_cadence', 'sales_cadence_target',
    'scan_card', 'search', 'service_report', 'service_request', 'service_territory',
    'session', 'settings', 'share', 'shift', 'skill', 'slider', 'sms', 'sobject',
    'solution', 'sort_policy', 'stage', 'step', 'strategy', 'survey', 'system_and_global_variable',
    'task', 'task2', 'team_member', 'text_template', 'textarea', 'textbox', 'thanks',
    'thanks_loading', 'timesheet', 'timesheet_entry', 'today', 'topic', 'trailhead',
    'trailhead_alt', 'unmatched', 'user', 'user_role', 'vehicle', 'visit', 'visits',
    'voice_call', 'waits', 'warranty_term', 'water', 'webcart', 'work_order', 'work_queue',
    'work_type', 'workforce_engagement'
];

const UTILITY = [
    'activity', 'add', 'add_above', 'add_below', 'adduser', 'advance', 'agent_session',
    'alert', 'all', 'anchor', 'animal_and_nature', 'announcement', 'answer', 'answered_twice',
    'anywhere_alert', 'anywhere_chat', 'apex', 'approval', 'apps', 'archive', 'arrow_bottom',
    'arrow_left', 'arrow_right', 'arrow_top', 'arrowdown', 'arrowup', 'attach', 'away',
    'back', 'block_visitor', 'bold', 'bookmark', 'bookmark_alt', 'brand_template', 'broadcast',
    'broadcasts', 'browser', 'bucket', 'bug', 'builder', 'button_choice', 'call', 'cancel_file_request',
    'cancel_transfer', 'capacity_plan', 'cart', 'case', 'category', 'center_align_text',
    'change_record_type', 'change_request', 'chart', 'chat', 'check', 'checkin', 'checkout',
    'chevrondown', 'chevronleft', 'chevronright', 'chevronup', 'choice', 'classic_interface',
    'clear', 'clock', 'close', 'collapse_all', 'color_swatch', 'comments', 'company',
    'component_customization', 'connected_apps', 'contact_request', 'contract', 'copy',
    'copy_to_clipboard', 'creator', 'crossfilter', 'custom_apps', 'cut', 'dash',
    'database', 'date_input', 'date_time', 'dayview', 'delete', 'description', 'desktop',
    'desktop_and_phone', 'desktop_console', 'dial_in', 'down', 'download', 'drag',
    'drag_and_drop', 'dynamic_record_choice', 'edit', 'edit_form', 'einstein', 'email',
    'email_open', 'emoji', 'end_call', 'end_chat', 'end_messaging_session', 'erect_window',
    'error', 'event', 'expand', 'expand_all', 'expand_alt', 'fallback', 'favorite',
    'feed', 'file', 'filter', 'filterList', 'flow', 'flow_alt', 'font_color', 'formula',
    'forward', 'forward_up', 'frozen', 'full_width_view', 'graph', 'group', 'groups',
    'handoff', 'help', 'help_center', 'hide', 'hide_mobile', 'high_velocity_sales',
    'hint', 'home', 'identity', 'image', 'inbox', 'incoming_call', 'info',
    'info_alt', 'insert_template', 'insert_tag_field', 'inspector_panel', 'internal_share',
    'italic', 'jump_to_bottom', 'jump_to_right', 'justify_text', 'kanban', 'key',
    'keyboard_dismiss', 'knowledge_base', 'knowledge_smart_link', 'label', 'layers', 'layout',
    'leave_conference', 'left', 'left_align_text', 'level_down', 'level_up', 'light_bulb',
    'lightning_inspector', 'like', 'link', 'linked', 'list', 'live_message', 'location',
    'lock', 'log_a_call', 'logout', 'loop', 'lower_flag', 'macros', 'magicwand', 'mark_all_as_read',
    'matrix', 'merge', 'merge_field', 'metrics', 'minimize_window', 'missed_call', 'money',
    'move', 'multi_picklist', 'multi_select_checkbox', 'muted', 'new', 'new_direct_message',
    'new_window', 'news', 'note', 'notebook', 'notification', 'number_input', 'office365',
    'offline', 'offline_cached', 'open', 'open_folder', 'opened_folder', 'orchestrator',
    'outbound_call', 'overflow', 'overlay', 'package', 'package_org', 'package_org_beta',
    'page', 'palette', 'paste', 'password', 'pause', 'pause_alt', 'people', 'phone_landscape',
    'phone_portrait', 'photo', 'picklist', 'picklist_choice', 'picklist_type', 'pin',
    'pinned', 'play', 'podcast_webinar', 'pop_in', 'power', 'preview', 'price_books',
    'print', 'priority', 'privately_shared', 'proposition', 'prompt', 'prompt_edit', 'puzzle',
    'question', 'question_mark', 'questions_and_answers', 'quick_text', 'quip', 'quotation_marks',
    'quote', 'radio_button', 'range_input', 'reassign', 'recipe', 'record', 'record_create',
    'record_delete', 'record_lookup', 'record_update', 'recurring_exception', 'redo', 'refresh',
    'relate', 'reminder', 'remove', 'remove_formatting', 'remove_link', 'replace', 'reply',
    'reply_all', 'report', 'reset', 'reset_password', 'resource_absence', 'resource_capacity',
    'resource_territory', 'retail_execution', 'retweet', 'ribbon', 'richtextbulletedlist',
    'richtextcheckbox', 'richtextchecklist', 'richtextcodeblock', 'richtextindent',
    'richtextnumberedlist', 'richtextoutdent', 'right', 'right_align_text', 'rotate', 'routing_offline',
    'rows', 'rules', 'runtime_sdk', 'salesforce1', 'save', 'screen', 'search', 'section',
    'send', 'settings', 'setup', 'setup_assistant_guide', 'setup_modal', 'share', 'share_file',
    'share_mobile', 'share_post', 'shield', 'shift_pattern_entry', 'shift_scheduling_operation',
    'shopping_bag', 'shortcuts', 'shuffle', 'side_list', 'signpost', 'simple_only', 'skip',
    'skip_back', 'skip_forward', 'slider', 'smiley_and_people', 'snippet', 'sobject_collection',
    'socialshare', 'sort', 'spinner', 'standard_objects', 'stop', 'store', 'strategy',
    'strikethrough', 'success', 'summary', 'summarydetail', 'survey', 'switch', 'symbols',
    'sync', 'table', 'table_settings', 'tablet_landscape', 'tablet_portrait', 'tabset', 'target',
    'task', 'text_background_color', 'text_template', 'text_template_type', 'textarea', 'textbox',
    'threedots', 'threedots_vertical', 'thunder', 'tile_card_list', 'toggle_panel_bottom',
    'toggle_panel_left', 'toggle_panel_right', 'toggle_panel_top', 'topic', 'topic2',
    'touch_action', 'tracker', 'trail', 'trailblazer_ext', 'trailhead', 'trailhead_alt', 'travel_and_places',
    'undelete', 'undeprecate', 'underline', 'undo', 'unlinked', 'unlock', 'unmuted', 'up',
    'upload', 'user', 'user_role', 'variable', 'variation_attribute_setup', 'variation_products',
    'video', 'view', 'voicemail_drop', 'volume_high', 'volume_low', 'volume_off', 'warning',
    'watchlist', 'weeklyview', 'wifi', 'work_order_type', 'world', 'yubi_key', 'zoomin',
    'zoomout'
];

const ACTION = [
    'add_contact', 'add_file', 'add_photo_video', 'add_relationship', 'announcement', 'apex',
    'approval', 'back', 'call', 'canvas', 'change_owner', 'change_record_type',
    'check', 'clone', 'close', 'defer', 'delete', 'description', 'dial_in', 'download',
    'edit', 'edit_groups', 'edit_relationship', 'email', 'fallback', 'filter', 'flow', 'follow',
    'following', 'freeze_user', 'goal', 'google_news', 'info', 'join_group', 'lead_convert',
    'leave_group', 'log_a_call', 'log_event', 'manage_perm_sets', 'map', 'more',
    'new', 'new_account', 'new_campaign', 'new_case', 'new_child_case', 'new_contact',
    'new_custom1', 'new_custom2', 'new_event', 'new_group', 'new_lead', 'new_note', 'new_notebook',
    'new_opportunity', 'new_person_account', 'new_task', 'password_unlock', 'preview',
    'priority', 'question_post_action', 'quote', 'recall', 'record', 'refresh', 'reject',
    'remove', 'remove_relationship', 'reset_password', 'script', 'share', 'share_file',
    'share_link', 'share_poll', 'share_post', 'share_thanks', 'share_video', 'submit_for_approval',
    'sort', 'update', 'update_status', 'upload', 'user', 'user_activation', 'view_relationship',
    'web_link'
];

const CUSTOM_COUNT = 112;
const CUSTOM = Array.from({ length: CUSTOM_COUNT }, (_, i) => `custom${i + 1}`);

function buildEntries(set, names) {
    return names.map((name) => ({
        id: `${set}-${name}`,
        iconName: `${set}:${name}`,
        set,
        name,
        humanLabel: name.replace(/_/g, ' ')
    }));
}

export const ICON_SETS = Object.freeze(['standard', 'utility', 'custom', 'action']);

export const ICON_CATALOG = Object.freeze({
    standard: Object.freeze(buildEntries('standard', STANDARD)),
    utility: Object.freeze(buildEntries('utility', UTILITY)),
    custom: Object.freeze(buildEntries('custom', CUSTOM)),
    action: Object.freeze(buildEntries('action', ACTION))
});

export function allIcons() {
    return ICON_SETS.flatMap((set) => ICON_CATALOG[set]);
}

export function iconsForSet(set) {
    return ICON_CATALOG[set] || [];
}

export function filterIcons(entries, searchTerm) {
    if (!Array.isArray(entries)) return [];
    const term = (searchTerm || '').trim().toLowerCase();
    if (!term) return entries;
    return entries.filter((entry) =>
        entry.iconName.toLowerCase().includes(term) ||
        entry.humanLabel.toLowerCase().includes(term)
    );
}

export function findIconByName(iconName) {
    if (!iconName) return null;
    return allIcons().find((entry) => entry.iconName === iconName) || null;
}
