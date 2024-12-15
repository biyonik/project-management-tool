/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 15/12/2024
 */

import { EmailAttachment } from './email-attachment.type'

export interface EmailOptions {
	to: string | string[]
	subject: string
	template?: string
	context?: Record<string, any>
	attachments?: EmailAttachment[]
	cc?: string | string[]
	bcc?: string | string[]
	from?: string
	replyTo?: string
}
