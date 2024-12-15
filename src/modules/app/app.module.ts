import { Module, OnModuleInit } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ExceptionHandlerRegistry } from 'src/common/services/exception-handler.registry'
import { GlobalExceptionFilter } from 'src/common/filters/global-exception.filter'
import { APP_FILTER, APP_INTERCEPTOR, ModuleRef } from '@nestjs/core'
import { EXCEPTION_HANDLER_METADATA } from 'src/common/decorators/exception-handlers'
import { GlobalExceptionHandlers } from 'src/common/handlers/global-exception.handler'
import { LoggerService } from 'src/common/services/logger.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { AuthModule } from '../auth/auth.module'
import { DatabaseModule } from '../base/database/database.module'
import { UserModule } from '../user/user.module'
import { RoleModule } from '../role/role.module'
import { ProjectModule } from '../project/project.module'
import { TaskModule } from '../task/task.module'
import * as Joi from 'joi'
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor'
import { I18nModule } from 'src/common/i18n/i18n.module'
import { AuditLogModule } from '../base/audit-log/audit-log.module'
import { EventDispatcherInterceptor } from 'src/common/interceptors/event-dispatch.interceptor'
import { EventDispatcher } from 'src/common/events/event-dispatcher.service'
import { EmailModule } from '../base/email/email.module'

@Module({
	imports: [
		I18nModule,
		EmailModule,
		AuditLogModule,
		AuthModule,
		DatabaseModule,
		UserModule,
		RoleModule,
		ProjectModule,
		TaskModule,
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: [
				`.env.${process.env.NODE_ENV}.local`,
				`.env.${process.env.NODE_ENV}`,
				'.env.local',
				'.env',
			],
			validationSchema: Joi.object({
				NODE_ENV: Joi.string()
					.valid('development', 'production', 'test')
					.default('development'),
				PORT: Joi.number().default(3000),

				DB_HOST: Joi.string().required(),
				DB_PORT: Joi.number().required(),
				DB_USERNAME: Joi.string().required(),
				DB_PASSWORD: Joi.string().required(),
				DB_DATABASE: Joi.string().required(),

				LOG_LEVEL: Joi.string()
					.valid('error', 'warn', 'info', 'debug')
					.default('info'),
				LOG_DIR: Joi.string().required(),
				LOG_MAX_FILES: Joi.string().required(),
				LOG_MAX_SIZE: Joi.string().required(),
				CONSOLE_LOG_ENABLED: Joi.boolean().default(true),
			}),
			validationOptions: {
				allowUnknown: true,
				abortEarly: true,
			},
			expandVariables: true,
		}),
	],
	controllers: [AppController],
	providers: [
		EventDispatcher,
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionFilter,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: ResponseInterceptor,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: EventDispatcherInterceptor,
		},
		ExceptionHandlerRegistry,
		GlobalExceptionHandlers,
		LoggerService,
		ConfigService,
		AppService,
	],
	exports: [],
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
