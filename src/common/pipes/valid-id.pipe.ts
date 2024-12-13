/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 09/12/2024
 */

import {
	BadRequestException,
	Injectable,
	ParseUUIDPipe,
	ArgumentMetadata,
} from '@nestjs/common'
import { ErrorResponse } from '../dto/error-response.dto'

@Injectable()
export class ValidIdPipe extends ParseUUIDPipe {
	async transform(value: string, metadata: ArgumentMetadata) {
		try {
			await super.transform(value, metadata)

			if (!value) {
				throw new BadRequestException(
					new ErrorResponse('EMPTY_ID', 'ID cannot be empty'),
				)
			}

			if (value.length !== 36) {
				throw new BadRequestException(
					new ErrorResponse(
						'INVALID_ID_LENGTH',
						'ID must be 36 characters long',
						{
							providedLength: value.length,
							expectedLength: 36,
							providedValue: value,
						},
					),
				)
			}

			if (/[^a-zA-Z0-9-]/.test(value)) {
				throw new BadRequestException(
					new ErrorResponse(
						'INVALID_ID_FORMAT',
						'ID contains invalid characters',
						{
							providedValue: value,
							allowedPattern: 'a-zA-Z0-9-',
						},
					),
				)
			}

			return value
		} catch (error) {
			if (error instanceof BadRequestException) {
				// Eğer zaten bir ErrorResponse ise, direkt kullan
				if (error.getResponse() instanceof ErrorResponse) {
					throw error
				}
				// Değilse, UUID hatası demektir
				throw new BadRequestException(
					new ErrorResponse(
						'INVALID_UUID',
						'The ID must be a valid UUID',
						{
							providedValue: value,
						},
					),
				)
			}
			throw error
		}
	}
}
