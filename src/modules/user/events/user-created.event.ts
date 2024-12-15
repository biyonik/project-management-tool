import { DomainEvent } from 'src/common/events/base/domain.event'
import { UserEntity } from 'src/modules/entities/domain/user.entity'

export class UserCreatedEvent extends DomainEvent {
	constructor(
		readonly user: UserEntity,
		userId: string,
	) {
		super(user.id, userId)
	}
}
