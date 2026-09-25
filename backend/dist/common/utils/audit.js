"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const uuid_1 = require("uuid");
const data_store_1 = require("../../database/data-store");
class AuditService {
    static log(params) {
        const entry = {
            id: (0, uuid_1.v4)(),
            actor_id: params.actorId,
            actor_role: params.actorRole,
            action: params.action,
            entity: params.entity,
            entity_id: params.entityId,
            before_state: params.beforeState,
            after_state: params.afterState,
            ip_address: params.ipAddress || '127.0.0.1',
            reason: params.reason,
            created_at: new Date().toISOString(),
        };
        data_store_1.store.auditLogs.unshift(entry);
        console.log(`[AUDIT] [${entry.actor_role}] ${entry.action} on ${entry.entity}:${entry.entity_id}`);
        return entry;
    }
}
exports.AuditService = AuditService;
