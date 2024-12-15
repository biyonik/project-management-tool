import { Module, OnModuleInit } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from '../entities/domain/user.entity'
import { CacheModule } from '../base/cache/cache.module'
import { UserRepository } from './user.repository'
import { EventDispatcher } from 'src/common/events/event-dispatcher.service'
import { UserCacheInvalidationHandler } from './events/handlers/cache-invalidation.handler'
import { UserAuditLogHandler } from './events/handlers/audit-log.handler'
import { UserCreatedEvent } from './events/user-created.event'
import { UserUpdatedEvent } from './events/user-updated.event'

@Module({
	controllers: [UserController],
	providers: [
		UserRepository,
		UserService,
		EventDispatcher,
		UserCacheInvalidationHandler,
		UserAuditLogHandler,
	],
	imports: [TypeOrmModule.forFeature([UserEntity]), CacheModule],
})
export class UserModule implements OnModuleInit {
	constructor(
		private readonly eventDispatcher: EventDispatcher,
		private readonly cacheHandler: UserCacheInvalidationHandler,
		private readonly auditHandler: UserAuditLogHandler,
	) {}
	onModuleInit() {
		// Register handlers
		this.eventDispatcher.registerHandler(
			UserCreatedEvent.name,
			this.cacheHandler,
		)
		this.eventDispatcher.registerHandler(
			UserUpdatedEvent.name,
			this.cacheHandler,
		)
		this.eventDispatcher.registerHandler(
			UserCreatedEvent.name,
			this.auditHandler,
		)
		this.eventDispatcher.registerHandler(
			UserUpdatedEvent.name,
			this.auditHandler,
		)
	}
}
