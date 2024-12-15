import { registerAs } from '@nestjs/config'

export default registerAs('email', () => ({
	// SMTP Configuration
	smtp: {
		host: process.env.SMTP_HOST,
		port: parseInt(process.env.SMTP_PORT, 10) || 587,
		secure: process.env.SMTP_SECURE === 'true',
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS,
	},

	// General Email Configuration
	from: {
		name: process.env.MAIL_FROM_NAME || 'No Reply',
		address: process.env.MAIL_FROM_ADDRESS || 'noreply@example.com',
	},

	// Template Configuration
	templates: {
		dir: process.env.EMAIL_TEMPLATE_DIR || 'templates/email',
	},

	// Queue Configuration
	queue: {
		attempts: parseInt(process.env.EMAIL_QUEUE_ATTEMPTS, 10) || 3,
		backoff: {
			type: process.env.EMAIL_QUEUE_BACKOFF_TYPE || 'exponential',
			delay: parseInt(process.env.EMAIL_QUEUE_BACKOFF_DELAY, 10) || 1000,
		},
	},
}))
