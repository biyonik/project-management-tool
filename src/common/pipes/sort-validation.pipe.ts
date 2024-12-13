/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 09/12/2024
 */

import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import { ErrorResponse } from '../dto/error-response.dto'

@Injectable()
export class SortValidationPipe implements PipeTransform {
	constructor(private readonly allowedFields: string[]) {}

	transform(
		value: string | undefined,
	): Array<{ field: string; order: 'ASC' | 'DESC' }> {
		// Eğer sort parametresi verilmediyse boş array dön
		if (!value) {
			return []
		}

		try {
			// sort=email:ASC,createdAt:DESC şeklinde gelen string'i parse et
			const sortParams = value.split(',')

			return sortParams.map((param) => {
				const [field, order] = param.split(':')

				// Field kontrolü
				if (!this.allowedFields.includes(field)) {
					throw new BadRequestException(
						ErrorResponse.of(
							'INVALID_SORT_FIELD',
							`Sort field '${field}' is not allowed`,
							{
								field,
								allowedFields: this.allowedFields,
							},
						),
					)
				}

				// Order kontrolü
				const upperOrder = order?.toUpperCase()
				if (!upperOrder || !['ASC', 'DESC'].includes(upperOrder)) {
					throw new BadRequestException(
						ErrorResponse.of(
							'INVALID_SORT_ORDER',
							'Sort order must be ASC or DESC',
							{
								field,
								providedOrder: order,
							},
						),
					)
				}

				return {
					field,
					order: upperOrder as 'ASC' | 'DESC',
				}
			})
		} catch (error) {
			if (error instanceof BadRequestException) {
				throw error
			}

			throw new BadRequestException(
				ErrorResponse.of(
					'INVALID_SORT_FORMAT',
					'Sort format should be field:order,field:order',
					{
						example: 'email:ASC,createdAt:DESC',
						providedValue: value,
					},
				),
			)
		}
	}
}
