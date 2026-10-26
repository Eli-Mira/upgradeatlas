<?php

namespace App\Services;

use App\Models\AuditEvent;

/**
 * Actor-bound audit trail helper. Every administrative mutation writes
 * one audit_events row inside the same transaction as the change.
 */
class Audit
{
    public static function record(?int $actorId, string $entity, string|int $pk, string $operation, ?array $old = null, ?array $new = null): AuditEvent
    {
        return AuditEvent::create([
            'actor_id' => $actorId,
            'entity_name' => $entity,
            'entity_pk' => (string) $pk,
            'operation' => $operation,
            'old_value' => $old,
            'new_value' => $new,
            'occurred_at' => now(),
        ]);
    }
}
