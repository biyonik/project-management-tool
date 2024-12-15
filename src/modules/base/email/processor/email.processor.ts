import { Process, Processor } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { Job } from 'bull'
import { EmailService } from '../services/email.service'
import { EmailOptions } from '../types/email-option.type'

@Processor('email')
export class EmailProcessor {
	private readonly logger = new Logger(EmailProcessor.name)

	constructor(private readonly emailService: EmailService) {}

	@Process('send')
	async handleSend(job: Job<EmailOptions>) {
		try {
			await this.emailService.sendImmediately(job.data)
			this.logger.log(`Email sent successfully: ${job.id}`)
		} catch (error) {
			this.logger.error(
				`Failed to send email: ${error.message}`,
				error.stack,
			)
			throw error
		}
	}
}
