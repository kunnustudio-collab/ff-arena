"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRouter = void 0;
const express_1 = require("express");
const data_store_1 = require("../../database/data-store");
const admin_middleware_1 = require("../../common/middleware/admin.middleware");
const audit_1 = require("../../common/utils/audit");
const router = (0, express_1.Router)();
// In-Memory store for editable legal policies
const legalPages = {
    terms: {
        title: 'Terms of Service',
        content: `## 1. Skill-Based Platform\nTournament X operates exclusively as a skill-based esports platform. Outcomes of all matches depend predominantly on the skills, coordination, reaction time, knowledge of game mechanics, and strategic decisions of participants.\n\n## 2. Eligibility & Age\nYou must be at least 18 years of age. Users from Andhra Pradesh, Assam, Nagaland, Odisha, Sikkim, and Telangana are strictly barred from participating in real-money fee tournaments in compliance with state laws.\n\n## 3. Fair Play & Anti-Cheat\nAny use of third-party scripts, memory modifiers, or emulators in mobile-only brackets will result in forfeiture of prizes and an immediate permanent hardware ban.`,
        lastUpdated: new Date().toISOString(),
    },
    privacy: {
        title: 'Privacy Policy',
        content: `## Privacy & Data Protection\nWe respect player data and comply with applicable personal data protection laws. KYC documentation is encrypted at rest and in transit. Identity documents are accessed exclusively by verified compliance officers for statutory identity verification and are never traded or sold.`,
        lastUpdated: new Date().toISOString(),
    },
    responsible: {
        title: 'Responsible Gaming & Player Protection',
        content: `## Play Responsibly\nEsports tournaments should be engaging and competitive, never financially distressing.\n- Set personal daily and monthly entry limits.\n- Never compete using borrowed money.\n- Take regular breaks.\n- Self-exclusion is available in account settings for temporary or permanent cool-off periods.`,
        lastUpdated: new Date().toISOString(),
    },
    refund: {
        title: 'Cancellation & Refund Policy',
        content: `## 100% Refund Guarantee on Cancellations\nIf any tournament is cancelled by Tournament X or fails to meet the minimum required participants before scheduled start time, 100% of the tournament entry fee is credited back immediately to the user's deposit balance with complete transaction audit tracking.`,
        lastUpdated: new Date().toISOString(),
    },
    rules: {
        title: 'Tournament Official Rules',
        content: `## Battle Royale Rules\n1. All registered players must enter the custom room within 10 minutes of room credentials publication.\n2. Team teaming (collusion) in Solo matches is strictly banned and results in disqualification.\n3. Screenshots showing kill count and final placement must be captured immediately upon match end.\n4. Admin decisions are final in match result reviews.`,
        lastUpdated: new Date().toISOString(),
    },
};
// GET /api/v1/settings/public
router.get('/public', (req, res) => {
    res.json({
        success: true,
        data: {
            appName: data_store_1.store.appSettings.get('brand_name') || 'Tournament X',
            tagline: data_store_1.store.appSettings.get('brand_tagline') || 'Compete. Climb. Win.',
            accentColor: data_store_1.store.appSettings.get('brand_accent_color') || '#00F0FF',
            maintenanceMode: data_store_1.store.appSettings.get('maintenance_mode') || false,
            minDeposit: data_store_1.store.appSettings.get('min_deposit') || 50,
            maxDeposit: data_store_1.store.appSettings.get('max_deposit') || 10000,
            minWithdrawal: data_store_1.store.appSettings.get('min_withdrawal') || 100,
            maxWithdrawal: data_store_1.store.appSettings.get('max_withdrawal') || 25000,
            withdrawalFeePercent: data_store_1.store.appSettings.get('withdrawal_fee_percent') || 2,
            platformFeePercent: data_store_1.store.appSettings.get('platform_fee_percent') || 10,
            minAge: data_store_1.store.appSettings.get('min_age') || 18,
            restrictedStates: data_store_1.store.appSettings.get('geo_restricted_states') || [
                'andhra pradesh',
                'assam',
                'nagaland',
                'odisha',
                'sikkim',
                'telangana',
            ],
            kycMandatoryForWithdrawal: data_store_1.store.appSettings.get('kyc_mandatory_for_withdrawal') || true,
        },
    });
});
// GET /api/v1/settings/legal/:page
router.get('/legal/:page', (req, res) => {
    const page = legalPages[req.params.page];
    if (!page) {
        return res.status(404).json({ success: false, message: 'Legal document not found' });
    }
    res.json({ success: true, data: page });
});
// ADMIN: PUT /api/v1/settings/public
router.put('/public', (0, admin_middleware_1.requireAdmin)(['SUPER_ADMIN']), (req, res) => {
    const body = req.body;
    if (body.appName)
        data_store_1.store.appSettings.set('brand_name', body.appName);
    if (body.tagline)
        data_store_1.store.appSettings.set('brand_tagline', body.tagline);
    if (body.accentColor)
        data_store_1.store.appSettings.set('brand_accent_color', body.accentColor);
    if (body.maintenanceMode !== undefined)
        data_store_1.store.appSettings.set('maintenance_mode', body.maintenanceMode);
    if (body.minDeposit !== undefined)
        data_store_1.store.appSettings.set('min_deposit', Number(body.minDeposit));
    if (body.maxDeposit !== undefined)
        data_store_1.store.appSettings.set('max_deposit', Number(body.maxDeposit));
    if (body.minWithdrawal !== undefined)
        data_store_1.store.appSettings.set('min_withdrawal', Number(body.minWithdrawal));
    if (body.maxWithdrawal !== undefined)
        data_store_1.store.appSettings.set('max_withdrawal', Number(body.maxWithdrawal));
    if (body.withdrawalFeePercent !== undefined)
        data_store_1.store.appSettings.set('withdrawal_fee_percent', Number(body.withdrawalFeePercent));
    audit_1.AuditService.log({
        actorId: req.user.id,
        actorRole: 'SUPER_ADMIN',
        action: 'UPDATE_SYSTEM_SETTINGS',
        entity: 'app_settings',
        entityId: 'global',
        afterState: body,
    });
    res.json({ success: true, message: 'Settings updated successfully' });
});
// ADMIN: PUT /api/v1/settings/legal/:page
router.put('/legal/:page', (0, admin_middleware_1.requireAdmin)(['SUPER_ADMIN']), (req, res) => {
    const pageKey = req.params.page;
    const { title, content } = req.body;
    if (!content)
        return res.status(400).json({ success: false, message: 'Content is required' });
    legalPages[pageKey] = {
        title: title || legalPages[pageKey]?.title || pageKey,
        content,
        lastUpdated: new Date().toISOString(),
    };
    audit_1.AuditService.log({
        actorId: req.user.id,
        actorRole: 'SUPER_ADMIN',
        action: 'UPDATE_LEGAL_PAGE',
        entity: 'legal_pages',
        entityId: pageKey,
    });
    res.json({ success: true, message: 'Legal document updated successfully' });
});
exports.settingsRouter = router;
