"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kycRouter = void 0;
const express_1 = require("express");
const kyc_service_1 = require("./kyc.service");
const auth_middleware_1 = require("../../common/middleware/auth.middleware");
const admin_middleware_1 = require("../../common/middleware/admin.middleware");
const router = (0, express_1.Router)();
// GET /api/v1/kyc/status
router.get('/status', auth_middleware_1.authenticate, (req, res) => {
    const kyc = kyc_service_1.KycService.getKycByUserId(req.user.id);
    res.json({
        success: true,
        data: kyc || { status: 'UNVERIFIED' },
    });
});
// POST /api/v1/kyc/submit
router.post('/submit', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const { legalName, dateOfBirth, address, state, pincode, idType, idNumber, payoutUpiId, payoutBankAccount, payoutBankIfsc, documentUrl } = req.body;
        if (!legalName || !dateOfBirth || !address || !state || !idType || !idNumber) {
            return res.status(400).json({ success: false, message: 'All mandatory KYC fields must be filled' });
        }
        const result = await kyc_service_1.KycService.submitKyc(req.user.id, {
            legalName,
            dateOfBirth,
            address,
            state,
            pincode: pincode || '',
            idType,
            idNumber,
            payoutUpiId,
            payoutBankAccount,
            payoutBankIfsc,
            documentUrl,
        });
        res.status(200).json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
});
// ADMIN: POST /api/v1/kyc/review
router.post('/review', (0, admin_middleware_1.requireAdmin)(['SUPER_ADMIN', 'ADMIN', 'KYC_ADMIN']), async (req, res, next) => {
    try {
        const { kycId, status, rejectionReason } = req.body;
        if (!kycId || !status) {
            return res.status(400).json({ success: false, message: 'kycId and status are required' });
        }
        const result = await kyc_service_1.KycService.reviewKyc(req.user.id, kycId, status, rejectionReason);
        res.json({ success: true, data: result });
    }
    catch (err) {
        next(err);
    }
});
exports.kycRouter = router;
