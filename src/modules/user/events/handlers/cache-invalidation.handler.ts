import { IEventHandler } from 'src/common/events/event-handler.interface'
import { UserCreatedEvent } from '../user-created.event'
import { UserUpdatedEvent } from '../user-updated.event'
import { Injectable } from '@nestjs/common'
import { CacheService } from 'src/modules/base/cache/cache.service'

@Injectable()
export class UserCacheInvalidationHandler
	implements IEventHandler<UserCreatedEvent | UserUpdatedEvent>
{
	constructor(private readonly cacheService: CacheService) {}

	async handle(event: UserCreatedEvent | UserUpdatedEvent): Promise<void> {
		await this.cacheService.clear(`user:${event.aggregateId}`)
		await this.cacheService.clear('users:list:*')
	}
}
