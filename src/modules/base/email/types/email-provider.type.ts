/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 15/12/2024
 */

import { EmailOptions } from './email-option.type'

export interface EmailProvider {
	send(options: EmailOptions): Promise<boolean>
	isHealthy(): Promise<boolean>
}
