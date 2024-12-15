import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'
import { EmailProvider } from '../types/email-provider.type'
import { EmailOptions } from '../types/email-option.type'
import { MessageSourceService } from 'src/common/i18n/message-source.service'
import { ErrorResponse } from 'src/common/dto/error-response.dto'
import { LocaleProvider } from 'src/common/i18n/locale.provider'

@Injectable()
export class SmtpProvider implements EmailProvider {
	private transporter: nodemailer.Transporter

	constructor(
		private readonly configService: ConfigService,
		private readonly messageSourceService: MessageSourceService,
	) {
		this.transporter = nodemailer.createTransport({
			host: this.configService.get('SMTP_HOST'),
			port: this.configService.get('SMTP_PORT'),
			secure: this.configService.get('SMTP_SECURE', true),
			auth: {
				user: this.configService.get('SMTP_USER'),
				pass: this.configService.get('SMTP_PASS'),
			},
		})
	}

	async send(options: EmailOptions): Promise<boolean> {
		try {
			await this.transporter.sendMail({
				from: options.from || this.configService.get('SMTP_FROM'),
				to: Array.isArray(options.to)
					? options.to.join(',')
					: options.to,
				cc: options.cc,
				bcc: options.bcc,
				subject: options.subject,
				html: options.template,
				attachments: options.attachments,
				replyTo: options.replyTo,
			})
			return true
		} catch (error) {
			throw new BadRequestException(
				ErrorResponse.of(
					'EMAIL_SEND_ERROR',
					this.messageSourceService.getMessage(
						'email.send.error',
						LocaleProvider.getLocale(),
					),
				),
			)
		}
	}

	async isHealthy(): Promise<boolean> {
		try {
			await this.transporter.verify()
			return true
		} catch {
			return false
		}
	}
}
