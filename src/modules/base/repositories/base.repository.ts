import { Repository, FindOptionsWhere, DeepPartial } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { NotFoundException } from '@nestjs/common'
import { ArchivableEntity } from 'src/modules/entities/base/archivable.entity'
import { ArchiveStatus } from 'src/common/enums/archive-status.enum'

export abstract class BaseRepository<T extends ArchivableEntity> {
	protected constructor(protected readonly repository: Repository<T>) {}

	async findById(id: string): Promise<T> {
		const entity = await this.repository.findOne({
			where: { id } as FindOptionsWhere<T>,
		})

		if (!entity) {
			throw new NotFoundException()
		}

		return entity
	}

	async findByWithPagination(
		criteria: FindOptionsWhere<T>,
		page: number,
		limit: number,
		sort: Array<{ field: string; order: 'ASC' | 'DESC' }>,
	): Promise<[T[], number]> {
		const queryBuilder = this.repository.createQueryBuilder(
			this.repository.metadata.tableName,
		)

		Object.entries(criteria).forEach(([key, value]) => {
			queryBuilder.andWhere(
				`${this.repository.metadata.tableName}.${key} = :${key}`,
				{
					[key]: value,
				},
			)
		})

		sort.forEach(({ field, order }) => {
			queryBuilder.addOrderBy(
				`${this.repository.metadata.tableName}.${field}`,
				order,
			)
		})

		return await queryBuilder
			.skip((page - 1) * limit)
			.take(limit)
			.getManyAndCount()
	}

	async create(data: DeepPartial<T>): Promise<T> {
		return await this.repository.save(data)
	}

	async update(id: string, data: QueryDeepPartialEntity<T>): Promise<T> {
		await this.repository.update(id, data)
		return this.findById(id)
	}

	async delete(id: string): Promise<boolean> {
		const result = await this.repository.delete(id)
		return result.affected > 0
	}

	async softDelete(
		id: string,
		data: QueryDeepPartialEntity<T>,
	): Promise<void> {
		await this.repository.update(id, {
			...data,
			deletedAt: new Date(),
		} as QueryDeepPartialEntity<T>)
	}

	async restore(id: string): Promise<T> {
		const entity = await this.repository.findOne({
			where: { id } as FindOptionsWhere<T>,
			withDeleted: true,
		})

		if (!entity) {
			throw new NotFoundException()
		}

		entity.deleted.deletedAt = null
		entity.deleted.deletedBy = null
		entity.deletionReason = null
		entity.archiveStatus = ArchiveStatus.ACTIVE

		return await this.repository.save(entity)
	}

	async findDeleted(page: number, limit: number): Promise<[T[], number]> {
		return await this.repository.findAndCount({
			where: {
				archiveStatus: ArchiveStatus.DELETED,
			} as FindOptionsWhere<T>,
			withDeleted: true,
			skip: (page - 1) * limit,
			take: limit,
		})
	}

	async findArchived(page: number, limit: number): Promise<[T[], number]> {
		return await this.repository.findAndCount({
			where: {
				archiveStatus: ArchiveStatus.ARCHIVED,
			} as FindOptionsWhere<T>,
			skip: (page - 1) * limit,
			take: limit,
		})
	}

	async loadRelations(id: string, relations: string[]): Promise<T> {
		const entity = await this.repository.findOne({
			where: { id } as FindOptionsWhere<T>,
			relations: relations,
		})

		if (!entity) {
			throw new NotFoundException()
		}

		return entity
	}
}
