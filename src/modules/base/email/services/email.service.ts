import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { TemplateService } from './template.service'
import { EmailProvider } from '../types/email-provider.type'
import { EmailOptions } from '../types/email-option.type'
import { MessageSourceService } from 'src/common/i18n/message-source.service'
import { ErrorResponse } from 'src/common/dto/error-response.dto'
import { LocaleProvider } from 'src/common/i18n/locale.provider'

@Injectable()
export class EmailService implements OnModuleInit {
	private provider: EmailProvider

	constructor(
		@InjectQueue('email') private readonly emailQueue: Queue,
		private readonly configService: ConfigService,
		private readonly templateService: TemplateService,
		private readonly messageSourceService: MessageSourceService,
	) {
		// Provider seçimi
		const provider = this.configService.get('EMAIL_PROVIDER', 'smtp')
		this.provider = provider
	}

	async onModuleInit() {
		await this.templateService.loadTemplates()
	}

	async sendEmail(options: EmailOptions): Promise<boolean> {
		try {
			// Template varsa render et
			if (options.template && options.context) {
				options.template = await this.templateService.render(
					options.template,
					options.context,
				)
			}

			// Email kuyruğuna ekle
			await this.emailQueue.add('send', options, {
				attempts: 3,
				backoff: {
					type: 'exponential',
					delay: 1000,
				},
			})

			return true
		} catch (error) {
			throw new BadRequestException(
				ErrorResponse.of(
					'EMAIL_QUEUE_ERROR',
					this.messageSourceService.getMessage(
						'email.queue.error',
						LocaleProvider.getLocale(),
					),
				),
			)
		}
	}

	async sendImmediately(options: EmailOptions): Promise<boolean> {
		// Template varsa render et
		if (options.template && options.context) {
			options.template = await this.templateService.render(
				options.template,
				options.context,
			)
		}

		return this.provider.send(options)
	}
}
