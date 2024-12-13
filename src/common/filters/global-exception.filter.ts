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
	HttpStatus,
} from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { Response } from 'express'
import { ExceptionHandlerRegistry } from '../services/exception-handler.registry'
import { ErrorResponse } from '../dto/error-response.dto'
import { MessageSourceService } from '../i18n/message-source.service'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	constructor(
		private readonly messageSource: MessageSourceService,
		private moduleRef: ModuleRef,
		private exceptionHandlerRegistry: ExceptionHandlerRegistry,
	) {}

	catch(exception: Error, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()
		const request = ctx.getRequest()
		const locale = request.params.locale || 'en'

		// Özel handler kontrolü
		const handler = this.exceptionHandlerRegistry.getHandler(exception)
		if (handler) {
			const errorResponse = handler(exception)
			return response.status(HttpStatus.BAD_REQUEST).json(errorResponse)
		}

		if (exception instanceof HttpException) {
			const status = exception.getStatus()
			const responseBody = exception.getResponse()

			// Eğer zaten bir ErrorResponse ise, direkt kullan
			if (responseBody instanceof ErrorResponse) {
				return response.status(status).json(responseBody)
			}

			// Değilse, standart error response oluştur
			return response
				.status(status)
				.json(
					ErrorResponse.of(
						status.toString(),
						this.messageSource.getMessage(
							exception.message,
							locale,
						),
						status,
					),
				)
		}

		// Beklenmeyen hatalar için
		return response
			.status(HttpStatus.INTERNAL_SERVER_ERROR)
			.json(
				ErrorResponse.of(
					'INTERNAL_SERVER_ERROR',
					this.messageSource.getMessage('server.error', locale),
					process.env.NODE_ENV === 'development'
						? exception.stack
						: undefined,
				),
			)
	}
}
