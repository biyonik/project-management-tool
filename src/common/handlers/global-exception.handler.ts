/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */
import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { LoggerService } from '../services/logger.service'
import { ConfigService } from '@nestjs/config'
import { LogLevel } from '../enums/log-level.enum'
import { ErrorResponse } from '../dto/error-response.dto'
import { BaseException } from '../exceptions/base.exception'
import { ExceptionHandlerRegistry } from '../services/exception-handler.registry'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	constructor(
		private readonly logger: LoggerService,
		private readonly config: ConfigService,
		private readonly exceptionHandlerRegistry: ExceptionHandlerRegistry,
	) {}

	catch(exception: Error, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest<Request>()

		// Request context'i
		const requestContext = {
			method: request.method,
			url: request.url,
			ip: request.ip,
			userId: request.user?.id, // TODO: Implement auth middleware
			correlationId: request.headers['x-correlation-id'],
			userAgent: request.headers['user-agent'],
		}

		// Custom handler'ı kontrol et
		const handler = this.exceptionHandlerRegistry.getHandler(exception)
		if (handler) {
			const errorResponse = handler(exception)
			const baseException = exception as BaseException

			this.logger.log(
				baseException.logLevel,
				baseException.message,
				exception,
				{ ...requestContext, errorResponse },
			)

			return response.status(baseException.statusCode).json(errorResponse)
		}

		// Built-in HTTP exception'ları için
		if (exception instanceof HttpException) {
			const status = exception.getStatus()
			const errorResponse = ErrorResponse.of(
				'HTTP_ERROR',
				exception.message,
				this.config.get('NODE_ENV') === 'development'
					? exception.stack
					: undefined,
			)

			this.logger.log(LogLevel.ERROR, exception.message, exception, {
				...requestContext,
				errorResponse,
			})

			return response.status(status).json(errorResponse)
		}

		// Beklenmeyen hatalar için
		const errorResponse = ErrorResponse.of(
			'INTERNAL_SERVER_ERROR',
			this.config.get('NODE_ENV') === 'production'
				? 'An unexpected error occurred'
				: exception.message,
			this.config.get('NODE_ENV') === 'development'
				? exception.stack
				: undefined,
		)

		this.logger.log(LogLevel.ERROR, 'Unhandled exception', exception, {
			...requestContext,
			errorResponse,
		})

		// Kritik hatalar için notification service'e bildirim gönder
		if (this.config.get('NODE_ENV') === 'production') {
			// NotificationService.notify('Critical Error', exception);
		}

		return response.status(500).json(errorResponse)
	}
}
