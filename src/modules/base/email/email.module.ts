import { Module, Global } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { BullModule } from '@nestjs/bull'
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import * as path from 'path'

// Services
import { EmailService } from './services/email.service'
import { TemplateService } from './services/template.service'
import { SmtpProvider } from './provider/smtp.provider'
import { EmailProcessor } from './processor/email.processor'

@Global()
@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),

		// Bull Queue Module
		BullModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				redis: {
					host: configService.get('REDIS_HOST', 'localhost'),
					port: configService.get('REDIS_PORT', 6379),
				},
			}),
			inject: [ConfigService],
		}),

		// Email Queue
		BullModule.registerQueue({
			name: 'email',
			defaultJobOptions: {
				attempts: 3,
				backoff: {
					type: 'exponential',
					delay: 1000,
				},
				removeOnComplete: true,
				removeOnFail: false,
			},
		}),

		// Mailer Module
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (config: ConfigService) => ({
				transport: {
					host: config.get('SMTP_HOST'),
					port: config.get('SMTP_PORT'),
					secure: config.get('SMTP_SECURE', true),
					auth: {
						user: config.get('SMTP_USER'),
						pass: config.get('SMTP_PASS'),
					},
				},
				defaults: {
					from: `"${config.get('MAIL_FROM_NAME')}" <${config.get('MAIL_FROM_ADDRESS')}>`,
				},
				template: {
					dir: path.join(process.cwd(), 'templates/email'),
					adapter: new HandlebarsAdapter(),
					options: {
						strict: true,
					},
				},
			}),
			inject: [ConfigService],
		}),
	],
	providers: [EmailService, TemplateService, SmtpProvider, EmailProcessor],
	exports: [EmailService],
})
export class EmailModule {}
