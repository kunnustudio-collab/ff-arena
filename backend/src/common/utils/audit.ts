import { v4 as uuidv4 } from 'uuid';
import { store, AuditLog } from '../../database/data-store';

export class AuditService {
  static log(params: {
    actorId?: string;
    actorRole: string;
    action: string;
    entity: string;
    entityId: string;
    beforeState?: any;
    afterState?: any;
    ipAddress?: string;
    reason?: string;
  }): AuditLog {
    const entry: AuditLog = {
      id: uuidv4(),
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

    store.auditLogs.unshift(entry);
    console.log(`[AUDIT] [${entry.actor_role}] ${entry.action} on ${entry.entity}:${entry.entity_id}`);
    return entry;
  }
}
