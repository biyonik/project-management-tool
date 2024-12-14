import { Injectable } from '@nestjs/common'
import { ArchivableEntity } from 'src/modules/entities/base/archivable.entity'
import { BaseRepository } from '../repositories/base.repository'
import { CacheService } from '../cache/cache.service'
import { AuditLogService } from '../audit-log/audit-log.service'
import { HttpStatus } from '@nestjs/common'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { MessageSourceService } from 'src/common/i18n/message-source.service'
import { IApiResponse } from 'src/common/interfaces/apiresponse.interface'
import { SuccessDataResponse } from 'src/common/dto/success-response.dto'
import { ErrorResponse } from 'src/common/dto/error-response.dto'
import FindAllParams from 'src/common/params/find-all.params'
import { SuccessPaginatedDataResponse } from 'src/common/dto/success-paginated-response.dto'
import { DeepPartial } from 'typeorm'
import { ArchiveStatus } from 'src/common/enums/archive-status.enum'
import { LocaleProvider } from 'src/common/i18n/locale.provider'

@Injectable()
export abstract class BaseService<T extends ArchivableEntity> {
	locale: string
	constructor(
		protected readonly repository: BaseRepository<T>,
		protected readonly cacheService: CacheService,
		protected readonly messageSource: MessageSourceService,
		protected readonly auditLogService: AuditLogService,
		protected readonly entityName: string,
	) {
		this.locale = LocaleProvider.getLocale()
	}

	protected getLocale() {
		return LocaleProvider.getLocale()
	}

	async findById(id: string): Promise<IApiResponse> {
		try {
			const cacheKey = this.getCacheKey(id)
			let entity = await this.cacheService.get<T>(cacheKey)

			if (!entity) {
				entity = await this.repository.findById(id)
				await this.cacheService.set(cacheKey, entity)
			}

			return SuccessDataResponse.of(entity)
		} catch (error) {
			console.log('findById locale: ', this.locale)
			return ErrorResponse.of(
				HttpStatus.NOT_FOUND.toString(),
				this.messageSource.getMessage(
					`${this.entityName}.not.found`,
					this.getLocale(),
					{ id },
				),
			)
		}
	}

	async findAll(params: FindAllParams): Promise<IApiResponse> {
		try {
			const cacheKey = `${this.entityName}:list:${JSON.stringify(params)}`
			let result = (await this.cacheService.get(cacheKey)) as {
				data: T[]
				total: number
			}

			if (!result) {
				const [data, total] =
					await this.repository.findByWithPagination(
						{},
						params.page,
						params.limit,
						params.sort,
					)
				result = { data, total }
				await this.cacheService.set(cacheKey, result)
			}

			return SuccessPaginatedDataResponse.createPaginated(
				result.data,
				result.total,
				params.page,
				params.limit,
				params.sort,
			)
		} catch (error) {
			return ErrorResponse.of(
				HttpStatus.INTERNAL_SERVER_ERROR.toString(),
				this.messageSource.getMessage(
					'common.error.internal',
					this.getLocale(),
				),
			)
		}
	}

	async create(data: DeepPartial<T>, userId: string): Promise<IApiResponse> {
		try {
			const entity = await this.repository.create(data)

			await this.auditLogService.logChange({
				entityType: this.entityName,
				entityId: entity.id,
				action: 'CREATE',
				newValues: entity,
				userId,
			})

			await this.invalidateListCache()

			return SuccessDataResponse.of(entity)
		} catch (error) {
			return ErrorResponse.of(
				HttpStatus.INTERNAL_SERVER_ERROR.toString(),
				this.messageSource.getMessage(
					`${this.entityName}.create.error`,
					'en',
				),
			)
		}
	}

	async update(
		id: string,
		data: Partial<T>,
		userId: string,
	): Promise<IApiResponse> {
		try {
			const oldEntity = await this.repository.findById(id)
			const updatedEntity = await this.repository.update(
				id,
				data as QueryDeepPartialEntity<T>,
			)

			await this.auditLogService.logChange({
				entityType: this.entityName,
				entityId: id,
				action: 'UPDATE',
				oldValues: oldEntity,
				newValues: updatedEntity,
				userId,
			})

			await this.invalidateEntityCache(id)

			return SuccessDataResponse.of(updatedEntity)
		} catch (error) {
			return ErrorResponse.of(
				HttpStatus.NOT_FOUND.toString(),
				this.messageSource.getMessage(
					`${this.entityName}.not.found`,
					'en',
					{ id },
				),
			)
		}
	}

	async softDelete(
		id: string,
		userId: string,
		reason?: string,
	): Promise<IApiResponse> {
		try {
			const oldEntity = await this.repository.findById(id)

			await this.repository.softDelete(id, {
				deletedBy: userId,
				deletionReason: reason,
				archiveStatus: ArchiveStatus.DELETED,
			} as unknown as QueryDeepPartialEntity<T>)

			await this.auditLogService.logChange({
				entityType: this.entityName,
				entityId: id,
				action: 'SOFT_DELETE',
				oldValues: oldEntity,
				userId,
				additionalInfo: { reason },
			})

			await this.invalidateEntityCache(id)

			return SuccessDataResponse.of(
				null,
				this.messageSource.getMessage(
					`${this.entityName}.deleted`,
					'en',
				),
			)
		} catch (error) {
			return ErrorResponse.of(
				HttpStatus.NOT_FOUND.toString(),
				this.messageSource.getMessage(
					`${this.entityName}.not.found`,
					'en',
					{ id },
				),
			)
		}
	}

	protected async invalidateEntityCache(id: string): Promise<void> {
		const pattern = `${this.entityName}:${id}*`
		await Promise.all([
			this.cacheService.delete(this.getCacheKey(id)),
			this.cacheService.clear(pattern),
			this.invalidateListCache(),
		])
	}

	protected async invalidateListCache(): Promise<void> {
		await this.cacheService.clear(`${this.entityName}:list:*`)
	}

	protected getCacheKey(id: string): string {
		return `${this.entityName}:${id}`
	}
}
