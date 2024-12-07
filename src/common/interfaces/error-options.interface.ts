/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

import { LogLevel } from '../enums/log-level.enum'

export interface ErrorOptions {
	statusCode?: number
	logLevel?: LogLevel
	isOperational?: boolean
	maskSensitiveData?: boolean
}
