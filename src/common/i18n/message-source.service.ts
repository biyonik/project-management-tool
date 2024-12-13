/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 13/12/2024
 */

import { Injectable, OnModuleInit } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class MessageSourceService implements OnModuleInit {
	private messages: Map<string, Map<string, string>> = new Map()
	private readonly defaultLocale = 'en'

	async onModuleInit() {
		const i18nPath = path.join(process.cwd(), 'i18n')
		const files = fs.readdirSync(i18nPath)

		for (const file of files) {
			if (file.startsWith('messages_') && file.endsWith('.properties')) {
				const locale = file
					.replace('messages_', '')
					.replace('.properties', '')
				const content = fs.readFileSync(
					path.join(i18nPath, file),
					'utf-8',
				)

				const messageMap = new Map<string, string>()
				content.split('\n').forEach((line) => {
					if (line && !line.startsWith('#')) {
						const [key, value] = line
							.split('=')
							.map((s) => s.trim())
						messageMap.set(key, value)
					}
				})

				this.messages.set(locale, messageMap)
			}
		}
	}

	getMessage(code: string, locale: string = this.defaultLocale): string {
		const messageMap =
			this.messages.get(locale) || this.messages.get(this.defaultLocale)
		return messageMap?.get(code) || code
	}
}
