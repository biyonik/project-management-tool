/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

import { ErrorOptions } from '../interfaces/error-options.interface'
import { LogLevel } from '../enums/log-level.enum'

export class BaseException extends Error {
	public readonly code: string
	public readonly statusCode: number
	public readonly logLevel: LogLevel
	public readonly isOperational: boolean
	public readonly maskSensitiveData: boolean
	public readonly details?: any

	constructor(
		code: string,
		message: string,
		details?: any,
		options: ErrorOptions = {},
	) {
		super(message)
		this.code = code
		this.statusCode = options.statusCode || 500
		this.logLevel = options.logLevel || LogLevel.ERROR
		this.isOperational = options.isOperational !== false
		this.maskSensitiveData = options.maskSensitiveData !== false
		this.details = details
	}
}
