import { HttpStatus, Injectable } from '@nestjs/common'
import { ErrorResponse } from 'src/common/dto/error-response.dto'
import {
	SuccessDataResponse,
	SuccessResponse,
} from 'src/common/dto/success-response.dto'
import { IApiResponse } from 'src/common/interfaces/apiresponse.interface'
import { CacheService } from '../base/cache/cache.service'
import { MessageSourceService } from 'src/common/i18n/message-source.service'
import { AuditLogService } from '../base/audit-log/audit-log.service'
import { BaseService } from '../base/services/base.service'
import { UserEntity } from '../entities/domain/user.entity'
import { UserRepository } from './user.repository'
import FindAllParams from 'src/common/params/find-all.params'
import { CachedList } from 'src/common/interfaces/cached-list.interface'
import { SuccessPaginatedDataResponse } from 'src/common/dto/success-paginated-response.dto'
import {
	ValidateUniqueEmailForCreate,
	ValidateUniqueEmailForUpdate,
} from 'src/common/decorators/validation/unique-email.decorator'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { LocaleProvider } from '../../common/i18n/locale.provider'
import { UserCreatedEvent } from './events/user-created.event'
import { EventDispatcher } from 'src/common/events/event-dispatcher.service'
import { UserUpdatedEvent } from './events/user-updated.event'

@Injectable()
export class UserService extends BaseService<UserEntity> {
	locale: string
	constructor(
		private readonly userRepository: UserRepository,
		private readonly eventDispatcher: EventDispatcher,
		cacheService: CacheService,
		messageSource: MessageSourceService,
		auditLogService: AuditLogService,
	) {
		super(
			userRepository,
			cacheService,
			messageSource,
			auditLogService,
			'user',
		)
		this.locale = LocaleProvider.getLocale()
	}

	async findAll({ sort, page, limit }: FindAllParams): Promise<IApiResponse> {
		const cacheKey = `users:list:${page}:${limit}:${JSON.stringify(sort)}`

		try {
			const cachedData =
				await this.cacheService.get<CachedList<UserEntity>>(cacheKey)
			if (cachedData) {
				return SuccessPaginatedDataResponse.createPaginated(
					cachedData.data,
					cachedData.total,
					page,
					limit,
					sort,
				)
			}

			const [data, total] =
				await this.userRepository.findByWithPagination(
					{},
					page,
					limit,
					sort,
				)

			if (total < 1) {
				return ErrorResponse.of(
					HttpStatus.NOT_FOUND.toString(),
					this.messageSource.getMessage(
						'user.not.found.all',
						this.getLocale(),
					),
				)
			}

			const cacheData: CachedList<UserEntity> = { data, total }
			await this.cacheService.set(cacheKey, cacheData, 300)

			return SuccessPaginatedDataResponse.createPaginated(
				data,
				total,
				page,
				limit,
				sort,
			)
		} catch (error) {
			return ErrorResponse.of(
				HttpStatus.INTERNAL_SERVER_ERROR.toString(),
				this.messageSource.getMessage(
					'internal.server.error',
					this.getLocale(),
				),
				error,
			)
		}
	}

	@ValidateUniqueEmailForCreate()
	async createUser(
		dto: CreateUserDto,
		userId: string,
	): Promise<IApiResponse> {
		try {
			const user = await this.userRepository.create(dto)

			await this.eventDispatcher.publish(
				new UserCreatedEvent(user, userId),
			)

			return SuccessDataResponse.of(user)
		} catch (error) {
			return ErrorResponse.of(
				HttpStatus.INTERNAL_SERVER_ERROR.toString(),
				this.messageSource.getMessage(
					'user.created.failed',
					this.getLocale(),
				),
				error,
			)
		}
	}

	@ValidateUniqueEmailForUpdate()
	async updateUser(
		id: string,
		dto: UpdateUserDto,
		userId: string,
	): Promise<IApiResponse> {
		try {
			const user = await this.userRepository.update(id, dto)

			await this.eventDispatcher.publish(
				new UserUpdatedEvent(user, dto, userId),
			)

			return SuccessDataResponse.of(user)
		} catch (error) {
			return ErrorResponse.of(
				HttpStatus.NOT_FOUND.toString(),
				this.messageSource.getMessage(
					'user.not.found',
					this.getLocale(),
				),
				error,
			)
		}
	}
	async findActiveUsers({
		page,
		limit,
		sort,
	}: FindAllParams): Promise<IApiResponse> {
		try {
			const [data, total] =
				await this.userRepository.findByWithPagination(
					{ isActive: true },
					page,
					limit,
					sort,
				)

			return SuccessPaginatedDataResponse.createPaginated(
				data,
				total,
				page,
				limit,
				sort,
			)
		} catch (error) {
			return ErrorResponse.of(
				HttpStatus.INTERNAL_SERVER_ERROR.toString(),
				this.messageSource.getMessage('active.user.fetch.error'),
			)
		}
	}

	async deactivateUser(
		id: string,
		userId: string,
		reason?: string,
	): Promise<IApiResponse> {
		const result = await super.softDelete(id, userId, reason)

		if (result instanceof SuccessResponse) {
			return SuccessResponse.of(
				this.messageSource.getMessage('user.deactivate.succeed'),
			)
		}

		return ErrorResponse.of(
			HttpStatus.INTERNAL_SERVER_ERROR.toString(),
			this.messageSource.getMessage('user.deactivate.error'),
		)
	}

	async getUserWithProfile(id: string): Promise<IApiResponse> {
		try {
			const userResult = await this.findById(id)

			if (!(userResult instanceof SuccessDataResponse)) {
				return userResult
			}

			const userWithProfile = await this.userRepository.loadRelations(
				userResult.data.id,
				['profile', 'roles'],
			)

			return SuccessDataResponse.of(userWithProfile)
		} catch (error) {
			return ErrorResponse.of(
				HttpStatus.NOT_FOUND.toString(),
				this.messageSource.getMessage('user.profile.not.found'),
			)
		}
	}

	private async invalidateCache(id?: string): Promise<void> {
		const promises = [this.cacheService.clear('users:list:*')]

		if (id) {
			promises.push(this.cacheService.delete(`user:${id}`))
		}

		await Promise.all(promises)
	}
}
