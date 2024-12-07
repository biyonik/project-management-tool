/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

export interface PaginationMeta {
	page: number
	limit: number
	totalItems: number
	totalPages: number
	hasNextPage: boolean
	hasPreviousPage: boolean
	sort?: Array<{ field: string; order: 'ASC' | 'DESC' }>
	filter?: Record<string, any>
}
