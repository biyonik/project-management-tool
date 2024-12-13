import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserEntity } from '../entities/domain/user.entity'
import { IApiResponse } from '../../common/interfaces/apiresponse.interface'
import { ErrorResponse } from '../../common/dto/error-response.dto'
import { SuccessPaginatedDataResponse } from '../../common/dto/success-paginated-response.dto'
import { CacheService } from '../base/cache/cache.service'
import FindAllParams from 'src/common/params/find-all.params'
import { BaseRepository } from '../base/repositories/base.repository'
import {
	SuccessDataResponse,
	SuccessResponse,
} from 'src/common/dto/success-response.dto'
import {
	ValidateUniqueEmailForCreate,
	ValidateUniqueEmailForUpdate,
} from 'src/common/decorators/validation/unique-email.decorator'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { CachedList } from 'src/common/interfaces/cached-list.interface'

@Injectable()
export class UserService extends BaseRepository<UserEntity, IApiResponse> {
	constructor(
		@InjectRepository(UserEntity)
		protected readonly repository: Repository<UserEntity>,
		protected readonly cacheService: CacheService,
	) {
		super(repository, cacheService, 'user')
	}

	async findAll({ sort, page, limit }: FindAllParams): Promise<IApiResponse> {
		const cacheKey = `users:list:${page}:${limit}:${JSON.stringify(sort)}`

		try {
			// Cache'den veriyi tipli olarak al
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

			// Database sorgusu ve diğer işlemler...
			const queryBuilder = this.repository.createQueryBuilder('user')

			sort.forEach(({ field, order }) => {
				queryBuilder.addOrderBy(`user.${field}`, order)
			})

			const [data, total] = await queryBuilder
				.skip((page - 1) * limit)
				.take(limit)
				.getManyAndCount()

			if (total < 1) {
				return ErrorResponse.of(
					HttpStatus.NOT_FOUND.toString(),
					'No users found',
				)
			}

			// Cache'e kaydet
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
				'Internal server error',
				error,
			)
		}
	}

	async findById(id: string): Promise<IApiResponse> {
		try {
			const user = await super.findById(id)
			return SuccessDataResponse.of(user)
		} catch (error) {
			return ErrorResponse.of(
				HttpStatus.NOT_FOUND.toString(),
				'User not found',
				{ id },
			)
		}
	}

	@ValidateUniqueEmailForCreate()
	public async create(createUserDto: CreateUserDto): Promise<IApiResponse> {
		try {
			const user = await super.create(createUserDto)
			if (user.success === true) {
				// Invalidate list cache
				await this.cacheService.clear('users:list:*' as string)

				// Invalidate user cache
				const data = user as SuccessDataResponse<UserEntity>
				await this.invalidateUserCache(data.data.id)
			}
			return SuccessDataResponse.of(user)
		} catch (error) {
			return ErrorResponse.of(
				HttpStatus.INTERNAL_SERVER_ERROR.toString(),
				'Failed to create user',
				error,
			)
		}
	}

	@ValidateUniqueEmailForUpdate()
	public async update(
		id: string,
		updateUserDto: UpdateUserDto,
	): Promise<IApiResponse> {
		try {
			const user = await super.update(id, updateUserDto)
			await this.invalidateUserCache(id)
			return SuccessDataResponse.of(user)
		} catch (error) {
			return ErrorResponse.of(
				HttpStatus.NOT_FOUND.toString(),
				'User not found',
				{ id },
			)
		}
	}

	public async delete(id: string): Promise<IApiResponse> {
		try {
			await super.delete(id)
			await this.invalidateUserCache(id)
			return SuccessResponse.of('User deleted successfully')
		} catch (error) {
			return ErrorResponse.of(
				HttpStatus.NOT_FOUND.toString(),
				'User not found',
				{ id },
			)
		}
	}

	public async findActiveUsers({
		page,
		limit,
		sort,
	}: FindAllParams): Promise<IApiResponse> {
		try {
			return await this.findByWithPagination(
				{ isActive: true },
				{ page, limit, sort },
			)
		} catch (error) {
			return ErrorResponse.of(
				HttpStatus.INTERNAL_SERVER_ERROR.toString(),
				'Error fetching active users',
				error,
			)
		}
	}

	public async deactivateUser(id: string): Promise<IApiResponse> {
		try {
			await this.softDelete(id)
			return SuccessResponse.of('User deactivated successfully')
		} catch (error) {
			return ErrorResponse.of(
				HttpStatus.INTERNAL_SERVER_ERROR.toString(),
				'Error deactivating user',
				error,
			)
		}
	}

	public async getUserWithProfile(id: string): Promise<IApiResponse> {
		try {
			const userWithProfile = await this.loadRelations(
				((await this.findById(id)) as SuccessDataResponse<UserEntity>)
					.data,
				['profile', 'roles'],
			)
			return SuccessDataResponse.of(userWithProfile)
		} catch (error) {
			return ErrorResponse.of(
				HttpStatus.NOT_FOUND.toString(),
				'User or profile not found',
				error,
			)
		}
	}

	private async invalidateUserCache(id: string): Promise<void> {
		await Promise.all([
			this.cacheService.delete(`user:${id}`),
			this.cacheService.clear('users:list:*'),
		])
	}
}
