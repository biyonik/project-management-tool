import { Injectable } from '@nestjs/common'
import { IEventHandler } from 'src/common/events/event-handler.interface'
import { UserCreatedEvent } from '../user-created.event'
import { UserUpdatedEvent } from '../user-updated.event'
import { AuditLogService } from 'src/modules/base/audit-log/audit-log.service'

@Injectable()
export class UserAuditLogHandler
	implements IEventHandler<UserCreatedEvent | UserUpdatedEvent>
{
	constructor(private readonly auditLogService: AuditLogService) {}

	async handle(event: UserCreatedEvent | UserUpdatedEvent): Promise<void> {
		await this.auditLogService.logChange({
			entityType: 'user',
			entityId: event.aggregateId,
			action: event.eventType,
			userId: event.userId,
			...(event instanceof UserUpdatedEvent && {
				changes: event.changes,
			}),
		})
	}
}
