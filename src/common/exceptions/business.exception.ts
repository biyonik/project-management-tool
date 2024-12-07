/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

import { LogLevel } from '../enums/log-level.enum'
import { BaseException } from './base.exception'

export class BusinessException extends BaseException {
	constructor(code: string, message: string, details?: any) {
		super(code, message, details, {
			statusCode: 400,
			logLevel: LogLevel.WARN,
			isOperational: true,
		})
	}
}
