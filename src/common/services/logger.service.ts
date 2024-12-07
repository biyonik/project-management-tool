/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as winston from 'winston'
import * as DailyRotateFile from 'winston-daily-rotate-file'
import { LogLevel } from '../enums/log-level.enum'

@Injectable()
export class LoggerService {
	private readonly logger: winston.Logger
	private readonly isProduction: boolean
	private readonly sensitiveFields = [
		'password',
		'token',
		'authorization',
		'secret',
		'credit_card',
		'cardNumber',
		'cvv',
	]

	constructor(private readonly configService: ConfigService) {
		this.isProduction = configService.get('NODE_ENV') === 'production'
		this.logger = this.initializeLogger()
	}

	private initializeLogger(): winston.Logger {
		const { combine, timestamp, json, colorize, printf } = winston.format

		// Custom format for development
		const devFormat = printf(({ timestamp, level, message, ...meta }) => {
			return `${timestamp} [${level}]: ${message} ${
				Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
			}`
		})

		// Base transport options
		const transportOptions = {
			dirname: this.configService.get('logger.directory'),
			maxFiles: this.configService.get('logger.maxFiles'),
			maxSize: this.configService.get('logger.maxSize'),
			format: combine(
				timestamp(),
				this.isProduction ? json() : combine(colorize(), devFormat),
			),
		}

		const transports: winston.transport[] = [
			// Application logs
			new DailyRotateFile({
				...transportOptions,
				filename: 'application-%DATE%.log',
				level: this.configService.get('logger.level'),
			}),
			// Error logs
			new DailyRotateFile({
				...transportOptions,
				filename: 'error-%DATE%.log',
				level: 'error',
			}),
		]

		// Console transport for development
		if (this.configService.get('logger.consoleLogEnabled')) {
			transports.push(
				new winston.transports.Console({
					format: combine(colorize(), timestamp(), devFormat),
				}),
			)
		}

		return winston.createLogger({
			level: this.configService.get('logger.level'),
			transports,
		})
	}

	log(level: LogLevel, message: string, error?: Error, context?: any): void {
		const logData = this.prepareLogData(message, error, context)
		this.logger.log(level, message, logData)
	}

	error(message: string, error?: Error, context?: any): void {
		this.log(LogLevel.ERROR, message, error, context)
	}

	warn(message: string, context?: any): void {
		this.log(LogLevel.WARN, message, null, context)
	}

	info(message: string, context?: any): void {
		this.log(LogLevel.INFO, message, null, context)
	}

	debug(message: string, context?: any): void {
		this.log(LogLevel.DEBUG, message, null, context)
	}

	private prepareLogData(message: string, error?: Error, context?: any): any {
		const logData: any = {
			timestamp: new Date().toISOString(),
			message,
			context: this.sanitizeContext(context),
		}

		if (error) {
			logData.error = {
				name: error.name,
				message: error.message,
				...(this.isProduction ? {} : { stack: error.stack }),
			}
		}

		// Request context varsa ekle
		if (context?.request) {
			logData.request = {
				method: context.request.method,
				url: context.request.url,
				ip: context.request.ip,
				userAgent: context.request.headers['user-agent'],
				correlationId: context.request.headers['x-correlation-id'],
			}
		}

		return logData
	}

	private sanitizeContext(context: any): any {
		if (!context) return context
		return this.maskSensitiveData(context, this.sensitiveFields)
	}

	private maskSensitiveData(obj: any, sensitiveFields: string[]): any {
		if (!obj || typeof obj !== 'object') return obj

		const masked = Array.isArray(obj) ? [...obj] : { ...obj }

		for (const key in masked) {
			if (
				sensitiveFields.some((field) =>
					key.toLowerCase().includes(field),
				)
			) {
				masked[key] = '*****'
			} else if (typeof masked[key] === 'object') {
				masked[key] = this.maskSensitiveData(
					masked[key],
					sensitiveFields,
				)
			}
		}

		return masked
	}
}
