import { PaginationMeta } from '../interfaces/pagination.interface'
import { SuccessResponse } from './success-response.dto'

/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */
export class SuccessPaginatedDataResponse<T> extends SuccessResponse {
	data: T[]
	meta: PaginationMeta

	constructor(data: T[], meta: PaginationMeta) {
		super()
		this.data = data
		this.meta = meta
	}

	static of(message: string): SuccessResponse {
		return new SuccessResponse(message)
	}

	static createPaginated<T>(
		data: T[],
		page: number,
		limit: number,
		totalItems: number,
		sort?: Array<{ field: string; order: 'ASC' | 'DESC' }>,
		filter?: Record<string, any>,
	): SuccessPaginatedDataResponse<T> {
		const totalPages = Math.ceil(totalItems / limit)

		const meta: PaginationMeta = {
			page,
			limit,
			totalItems,
			totalPages,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
			...(sort && { sort }),
			...(filter && { filter }),
		}

		return new SuccessPaginatedDataResponse(data, meta)
	}
}
