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
import { ValidateUniqueEmailForUpdate } from 'src/common/decorators/validation/unique-email.decorator'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { LocaleProvider } from '../../common/i18n/locale.provider'
import { UserCreatedEvent } from './events/user-created.event'
import { UserUpdatedEvent } from './events/user-updated.event'
import { IApiEventResponse } from 'src/common/interfaces/api-event.response.interface'

@Injectable()
export class UserService extends BaseService<UserEntity> {
	locale: string
	constructor(
		private readonly userRepository: UserRepository,
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

	private async checkEmailExists(email: string): Promise<boolean> {
		const user = await this.userRepository.findByEmail(email)
		return !!user
	}

	async createUser(
		dto: CreateUserDto,
		userId: string,
	): Promise<IApiEventResponse> {
		try {
			const emailIsExists = await this.checkEmailExists(dto.email)
			if (emailIsExists) {
				return ErrorResponse.of(
					HttpStatus.BAD_REQUEST.toString(),
					this.messageSource.getMessage(
						'user.email.exists',
						this.getLocale(),
					),
				)
			}

			const user = await this.userRepository.create(dto)

			return {
				...SuccessDataResponse.of(user),
				events: [new UserCreatedEvent(user, userId)],
			}
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
	): Promise<IApiEventResponse> {
		try {
			const user = await this.userRepository.update(id, dto)

			return {
				...SuccessDataResponse.of(user),
				events: [new UserUpdatedEvent(user, dto, userId)],
			}
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
}
