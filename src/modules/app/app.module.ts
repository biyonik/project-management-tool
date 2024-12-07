import { Module, OnModuleInit } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ExceptionHandlerRegistry } from 'src/common/services/exception-handler.registry'
import { GlobalExceptionFilter } from 'src/common/filters/global-exception.filter'
import { APP_FILTER, ModuleRef } from '@nestjs/core'
import { EXCEPTION_HANDLER_METADATA } from 'src/common/decorators/exception-handlers'
import { GlobalExceptionHandlers } from 'src/common/handlers/global-exception.handler'
import { LoggerService } from 'src/common/services/logger.service'
import { ConfigService } from '@nestjs/config'

@Module({
	imports: [],
	controllers: [AppController],
	providers: [
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionFilter,
		},
		ExceptionHandlerRegistry,
		GlobalExceptionHandlers,
		LoggerService,
		ConfigService,
		AppService,
	],
})
export class AppModule implements OnModuleInit {
	constructor(
		private moduleRef: ModuleRef,
		private exceptionHandlerRegistry: ExceptionHandlerRegistry,
		private exceptionHandlers: GlobalExceptionHandlers,
	) {}

	onModuleInit() {
		// Handler'ları otomatik olarak kaydet
		const prototype = Object.getPrototypeOf(this.exceptionHandlers)
		const methodNames = Object.getOwnPropertyNames(prototype).filter(
			(name) => name !== 'constructor',
		)

		for (const methodName of methodNames) {
			const exceptionType = Reflect.getMetadata(
				EXCEPTION_HANDLER_METADATA,
				prototype,
				methodName,
			)

			if (exceptionType) {
				const handler = this.exceptionHandlers[methodName].bind(
					this.exceptionHandlers,
				)
				this.exceptionHandlerRegistry.register(exceptionType, handler)
			}
		}
	}
}
