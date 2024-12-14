/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 13/12/2024
 */

import { Injectable, OnModuleInit } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import * as chokidar from 'chokidar'

@Injectable()
export class MessageSourceService implements OnModuleInit {
	private messages: Map<string, Map<string, string>> = new Map()
	private readonly defaultLocale = 'en'
	private readonly i18nPath = path.join(process.cwd(), 'i18n')

	async onModuleInit() {
		// İlk yüklemede tüm dosyaları oku
		await this.loadAllMessages()

		// Dosya değişikliklerini izle
		this.watchFiles()
	}

	private async loadAllMessages() {
		const files = fs.readdirSync(this.i18nPath)
		for (const file of files) {
			if (file.startsWith('messages_') && file.endsWith('.properties')) {
				await this.loadMessagesFile(file)
			}
		}
	}

	private async loadMessagesFile(file: string) {
		const locale = file.replace('messages_', '').replace('.properties', '')
		const content = fs.readFileSync(path.join(this.i18nPath, file), 'utf-8')

		const messageMap = new Map<string, string>()
		content.split('\n').forEach((line) => {
			if (line && !line.startsWith('#')) {
				const [key, value] = line.split('=').map((s) => s.trim())
				messageMap.set(key, value.replace(/^"|"$/g, ''))
			}
		})

		this.messages.set(locale, messageMap)
		console.log(`Loaded messages for locale: ${locale}`)
	}

	private watchFiles() {
		const watcher = chokidar.watch(
			`${this.i18nPath}/messages_*.properties`,
			{
				persistent: true,
			},
		)

		watcher
			.on('change', async (filePath) => {
				const filename = path.basename(filePath)
				console.log(`Message file changed: ${filename}`)
				await this.loadMessagesFile(filename)
			})
			.on('error', (error) => console.error(`Watch error: ${error}`))
	}

	getMessage(
		code: string,
		locale: string = this.defaultLocale,
		params?: Record<string, any>,
	): string {
		const messageMap =
			this.messages.get(locale) || this.messages.get(this.defaultLocale)
		let message = messageMap?.get(code) || code

		// Parametreleri yerleştir
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				message = message.replace(
					new RegExp(`{${key}}`, 'g'),
					value.toString(),
				)
			})
		}

		return message
	}
}
