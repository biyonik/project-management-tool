/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

import { ValidationError } from 'class-validator'
import { BaseException } from './base.exception'
import { LogLevel } from '../enums/log-level.enum'

export class ValidationException extends BaseException {
	constructor(
		public readonly errors: ValidationError[],
		message: string = 'Validation failed',
	) {
		super('VALIDATION_ERROR', message, errors, {
			statusCode: 422,
			logLevel: LogLevel.WARN,
			isOperational: true,
			maskSensitiveData: true,
		})
	}
}
