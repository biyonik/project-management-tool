/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

import { LoggerService } from '../services/logger.service'
import { LogOrder } from '../enums/log-order.enum'
import { LogMetadata } from '../interfaces/log-metada.interfaces'

const LOG_METADATA_KEY = 'method_logs'

export function InfoLog(
	message: string,
	context?: any,
	options: { order: LogOrder } = { order: LogOrder.Middle },
) {
	return createMethodDecorator('info', message, context, options)
}

export function ErrorLog(
	message: string,
	context?: any,
	options: { order: LogOrder } = { order: LogOrder.Middle },
) {
	return createMethodDecorator('error', message, context, options)
}

export function WarnLog(
	message: string,
	context?: any,
	options: { order: LogOrder } = { order: LogOrder.Middle },
) {
	return createMethodDecorator('warn', message, context, options)
}

export function DebugLog(
	message: string,
	context?: any,
	options: { order: LogOrder } = { order: LogOrder.Middle },
) {
	return createMethodDecorator('debug', message, context, options)
}

function createMethodDecorator(
	level: 'info' | 'error' | 'warn' | 'debug',
	message: string,
	context?: any,
	options: { order: LogOrder } = { order: LogOrder.Middle },
) {
	return (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	) => {
		const originalMethod = descriptor.value
		const logMetadata: LogMetadata = {
			message,
			context,
			order: options.order,
			evaluateContext: typeof context === 'function',
		}

		// Mevcut metadata'yı al veya yeni array oluştur
		const existingMetadata: LogMetadata[] =
			Reflect.getMetadata(LOG_METADATA_KEY, target, propertyKey) || []

		// Yeni metadata'yı ekle
		Reflect.defineMetadata(
			LOG_METADATA_KEY,
			[...existingMetadata, { ...logMetadata, level }],
			target,
			propertyKey,
		)

		descriptor.value = async function (...args: any[]) {
			const logger: LoggerService = this.logger
			if (!logger) {
				throw new Error(
					'LoggerService must be injected as "logger" property',
				)
			}

			try {
				// İlk logları çalıştır (order: First)
				executeLogsByOrder(LogOrder.First, this, args, logger)

				// Metodu çalıştır
				const result = await originalMethod.apply(this, args)

				// Başarılı durumda middle ve last logları çalıştır
				executeLogsByOrder(LogOrder.Middle, this, args, logger)
				executeLogsByOrder(LogOrder.Last, this, args, logger)

				return result
			} catch (error) {
				// Hata durumunda error loglarını çalıştır
				const metadata =
					Reflect.getMetadata(
						LOG_METADATA_KEY,
						target,
						propertyKey,
					) || []
				const errorLogs = metadata.filter((m) => m.level === 'error')

				errorLogs.forEach((log) => {
					const evaluatedContext = log.evaluateContext
						? log.context.call(this, error, ...args)
						: log.context

					logger[log.level](log.message, error, evaluatedContext)
				})

				throw error
			}
		}

		return descriptor
	}
}

function executeLogsByOrder(
	order: LogOrder,
	instance: any,
	args: any[],
	logger: LoggerService,
) {
	const metadata: Array<LogMetadata & { level: string }> =
		Reflect.getMetadata(
			LOG_METADATA_KEY,
			instance.constructor.prototype,
			instance.constructor.name,
		) || []

	metadata
		.filter((m) => m.order === order)
		.forEach((log) => {
			const evaluatedContext = log.evaluateContext
				? log.context.call(instance, ...args)
				: log.context

			logger[log.level](log.message, evaluatedContext)
		})
}
