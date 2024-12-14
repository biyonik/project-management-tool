import { Repository, FindOptionsWhere, DeepPartial } from 'typeorm'
import { CacheService } from '../cache/cache.service'
import {
	HttpException,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { IApiResponse } from 'src/common/interfaces/apiresponse.interface'
import { SuccessPaginatedDataResponse } from 'src/common/dto/success-paginated-response.dto'
import { CachedList } from 'src/common/interfaces/cached-list.interface'
import FindAllParams from 'src/common/params/find-all.params'
import { MessageSourceService } from 'src/common/i18n/message-source.service'
import { AuditLogService } from '../audit-log/audit-log.service'
import { ArchivableEntity } from 'src/modules/entities/base/archivable.entity'
import { ArchiveStatus } from 'src/common/enums/archive-status.enum'

export abstract class BaseRepository<T extends ArchivableEntity, R = T> {
	protected constructor(
		protected readonly repository: Repository<T>,
		protected readonly cacheService: CacheService,
		protected readonly entityName: string,
		protected readonly messageSource: MessageSourceService,
		protected readonly auditLogService: AuditLogService,
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

	protected async create(data: DeepPartial<T>, userId: string): Promise<R> {
		const savedEntity = await this.repository.save(data as DeepPartial<T>)
		const typedEntity = savedEntity as T

		await this.auditLogService.logChange({
			entityType: this.entityName,
			entityId: savedEntity.id,
			action: 'CREATE',
			newValues: this.getEntityValues(savedEntity),
			userId,
		})

		const cacheKey = this.getCacheKey(typedEntity.id)
		await this.cacheService.set(cacheKey, typedEntity)
		return typedEntity as unknown as R
	}

	protected async update(
		id: string,
		data: DeepPartial<T>,
		userId: string,
	): Promise<R> {
		const oldEntity = await this.repository.findOne({
			where: { id: id } as FindOptionsWhere<T>,
		})

		if (!oldEntity) {
			throw new NotFoundException(
				`${this.entityName} with id ${id} not found`,
			)
		}

		const updated = await this.repository.update(
			id,
			data as QueryDeepPartialEntity<T>,
		)

		await this.auditLogService.logChange({
			entityType: this.entityName,
			entityId: id,
			action: 'UPDATE',
			oldValues: this.getEntityValues(oldEntity),
			newValues: this.getEntityValues(updated.raw),
			userId,
		})

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

	protected async softDelete(
		id: string,
		userId: string,
		reason?: string,
	): Promise<void> {
		const entityToDelete = await this.findById(id)

		const updateQuery = this.repository
			.createQueryBuilder()
			.update(this.repository.target)
			.set({
				deletedBy: userId,
				deletionReason: reason,
				archiveStatus: ArchiveStatus.DELETED,
				deletedAt: new Date(),
			} as unknown as QueryDeepPartialEntity<T>)
			.where('id = :id', { id })

		await updateQuery.execute()

		await this.auditLogService.logChange({
			entityType: this.entityName,
			entityId: id,
			action: 'SOFT_DELETE',
			oldValues: this.getEntityValues(entityToDelete),
			userId,
			additionalInfo: { reason },
		})

		await this.invalidateEntityCache(id)
	}

	protected async archive(id: string, userId: string): Promise<void> {
		const entity = await this.findById(id)

		const updateQuery = this.repository
			.createQueryBuilder()
			.update(this.repository.target)
			.set({
				archiveStatus: ArchiveStatus.ARCHIVED,
				archiveDate: new Date(),
				archivedBy: userId,
			} as unknown as QueryDeepPartialEntity<T>)
			.where('id = :id', { id })

		await updateQuery.execute()

		await this.auditLogService.logChange({
			entityType: this.entityName,
			entityId: id,
			action: 'ARCHIVE',
			oldValues: this.getEntityValues(entity),
			userId,
		})

		await this.invalidateEntityCache(id)
	}

	protected async restore(id: string, userId: string): Promise<R> {
		const entity = await this.repository.findOne({
			where: { id } as FindOptionsWhere<T>,
			withDeleted: true,
		})

		if (!entity) {
			throw new NotFoundException(
				this.messageSource.getMessage(
					`${this.entityName}.not.found`,
					'en',
					{ id },
				),
			)
		}

		entity.deletedAt = null
		entity.deletedBy = null
		entity.deletionReason = null
		entity.archiveStatus = ArchiveStatus.ACTIVE

		const restoredEntity = await this.repository.save(entity)

		await this.auditLogService.logChange({
			entityType: this.entityName,
			entityId: id,
			action: 'RESTORE',
			newValues: this.getEntityValues(restoredEntity),
			userId,
		})

		return restoredEntity as unknown as R
	}

	protected async findDeleted(options: {
		page: number
		limit: number
	}): Promise<[T[], number]> {
		return await this.repository.findAndCount({
			where: { archiveStatus: 'DELETED' } as FindOptionsWhere<T>,
			withDeleted: true,
			skip: (options.page - 1) * options.limit,
			take: options.limit,
		})
	}

	protected async findArchived(options: {
		page: number
		limit: number
	}): Promise<[T[], number]> {
		return await this.repository.findAndCount({
			where: { archiveStatus: 'ARCHIVED' } as FindOptionsWhere<T>,
			skip: (options.page - 1) * options.limit,
			take: options.limit,
		})
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

	private getEntityValues(entity: R | T): Record<string, any> {
		const metadata = this.repository.metadata
		const values: Record<string, any> = {}

		metadata.columns.forEach((column) => {
			if (!column.isVirtual) {
				values[column.propertyName] = entity[column.propertyName]
			}
		})

		return values
	}
}
