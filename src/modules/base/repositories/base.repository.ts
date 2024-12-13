import { Repository, FindOptionsWhere, DeepPartial } from 'typeorm'
import { CacheService } from '../cache/cache.service'
import {
	BadRequestException,
	HttpException,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common'
import { BaseEntity } from 'src/modules/entities/base/base.entity'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { IApiResponse } from 'src/common/interfaces/apiresponse.interface'
import { SuccessResponse } from 'src/common/dto/success-response.dto'
import { SuccessPaginatedDataResponse } from 'src/common/dto/success-paginated-response.dto'
import { CachedList } from 'src/common/interfaces/cached-list.interface'
import FindAllParams from 'src/common/params/find-all.params'
import { MessageSourceService } from 'src/common/i18n/message-source.service'

export abstract class BaseRepository<T extends BaseEntity, R = T> {
	protected constructor(
		protected readonly repository: Repository<T>,
		protected readonly cacheService: CacheService,
		protected readonly entityName: string,
		protected readonly messageSource: MessageSourceService,
	) {}

	protected async findById(id: string, locale?: string): Promise<R> {
		const cacheKey = this.getCacheKey(id)
		const cachedData = await this.cacheService.get<T>(cacheKey)

		if (cachedData) {
			return cachedData as unknown as R
		}

		const entity = await this.repository.findOne({
			where: { id } as unknown as FindOptionsWhere<T>,
		})

		if (!entity) {
			throw new NotFoundException(
				`${this.entityName} with id ${id} not found`,
			)
		}

		await this.cacheService.set(cacheKey, entity)
		return entity as unknown as R
	}

	protected async create(data: DeepPartial<T>): Promise<R> {
		const savedEntity = await this.repository.save(data as DeepPartial<T>)
		const typedEntity = savedEntity as T
		const cacheKey = this.getCacheKey(typedEntity.id)
		await this.cacheService.set(cacheKey, typedEntity)
		return typedEntity as unknown as R
	}

	protected async update(id: string, data: DeepPartial<T>): Promise<R> {
		await this.repository.update(id, data as QueryDeepPartialEntity<T>)

		const updated = await this.repository.findOne({
			where: { id } as FindOptionsWhere<T>,
		})

		if (!updated) {
			throw new NotFoundException(
				`${this.entityName} with id ${id} not found`,
			)
		}

		const cacheKey = this.getCacheKey(id)
		await this.cacheService.set(cacheKey, updated)

		return updated as unknown as R
	}

	protected async delete(id: string): Promise<IApiResponse> {
		const result = await this.repository.delete(id)
		if (result.affected === 0) {
			throw new NotFoundException(
				`${this.entityName} with id ${id} not found`,
			)
		}

		const cacheKey = this.getCacheKey(id)
		await this.cacheService.delete(cacheKey)
		return { success: true, timestamp: new Date().toISOString() }
	}

	protected async findByWithPagination(
		criteria: FindOptionsWhere<T>,
		{ page, limit, sort }: FindAllParams,
	): Promise<R> {
		const cacheKey = `${this.entityName}:findBy:${JSON.stringify(criteria)}:${page}:${limit}:${JSON.stringify(sort)}`

		try {
			const cachedData =
				await this.cacheService.get<CachedList<T>>(cacheKey)
			if (cachedData) {
				return SuccessPaginatedDataResponse.createPaginated(
					cachedData.data,
					cachedData.total,
					page,
					limit,
					sort,
				) as R
			}

			const queryBuilder = this.repository.createQueryBuilder(
				this.entityName,
			)

			// Kriterleri ekle
			Object.entries(criteria).forEach(([key, value]) => {
				queryBuilder.andWhere(`${this.entityName}.${key} = :${key}`, {
					[key]: value,
				})
			})

			// Sıralama
			sort.forEach(({ field, order }) => {
				queryBuilder.addOrderBy(`${this.entityName}.${field}`, order)
			})

			// Sayfalama
			const [data, total] = await queryBuilder
				.skip((page - 1) * limit)
				.take(limit)
				.getManyAndCount()

			const cacheData: CachedList<T> = { data, total }
			await this.cacheService.set(cacheKey, cacheData, 300)

			return SuccessPaginatedDataResponse.createPaginated(
				data,
				total,
				page,
				limit,
				sort,
			) as R
		} catch (error) {
			throw new InternalServerErrorException(
				`Error fetching ${this.entityName} with criteria: ${JSON.stringify(criteria)}`,
				error,
			)
		}
	}

	protected async softDelete(id: string): Promise<R> {
		try {
			// Önce entity'nin var olduğundan emin ol
			const entityToDelete = (await this.findById(id)) as BaseEntity

			// İlişkili verileri kontrol et
			const metadata = this.repository.metadata
			const relations = metadata.relations

			// Her ilişki için kontrol
			for (const relation of relations) {
				if (relation.onDelete === 'RESTRICT') {
					const count = await this.repository
						.createQueryBuilder()
						.relation(metadata.name, relation.propertyName)
						.of(entityToDelete.id) // entityToDelete'i kullan
						.loadMany()

					if (count && count.length > 0) {
						throw new BadRequestException(
							`Cannot delete ${this.entityName} due to existing ${relation.propertyName}`,
						)
					}
				}
			}

			// Soft delete işlemi
			await this.repository.softDelete(entityToDelete.id) // entityToDelete'i kullan

			// Cache temizleme
			await this.invalidateEntityCache(entityToDelete.id)

			return SuccessResponse.of(
				`${this.entityName} soft deleted successfully`,
			) as R
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new InternalServerErrorException(
				`Error soft deleting ${this.entityName}`,
				error,
			)
		}
	}

	protected async loadRelations(entity: T, relations: string[]): Promise<T> {
		try {
			const cacheKey = `${this.entityName}:${entity.id}:relations:${relations.join(',')}`

			// Cache kontrolü
			const cachedEntity = await this.cacheService.get<T>(cacheKey)
			if (cachedEntity) {
				return cachedEntity
			}

			// İlişkileri yükle
			const loadedEntity = await this.repository.findOne({
				where: { id: entity.id } as FindOptionsWhere<T>,
				relations: relations,
			})

			if (!loadedEntity) {
				throw new NotFoundException(
					`${this.entityName} with id ${entity.id} not found`,
				)
			}

			// Cache'e kaydet
			await this.cacheService.set(cacheKey, loadedEntity, 300)

			return loadedEntity
		} catch (error) {
			if (error instanceof HttpException) {
				throw error
			}
			throw new InternalServerErrorException(
				`Error loading relations for ${this.entityName}`,
				error,
			)
		}
	}

	protected async invalidateEntityCache(id: string): Promise<void> {
		const pattern = `${this.entityName}:${id}*`
		await Promise.all([
			this.cacheService.delete(`${this.entityName}:${id}`),
			this.cacheService.clear(pattern),
			this.cacheService.clear(`${this.entityName}:list:*`),
			this.cacheService.clear(`${this.entityName}:findBy:*`),
		])
	}

	protected getCacheKey(id: string): string {
		return `${this.entityName}:${id}`
	}
}
