/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 15/12/2024
 */

export interface EmailAttachment {
	filename: string
	content: Buffer | string
	contentType?: string
}
