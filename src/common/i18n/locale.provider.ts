/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 13/12/2024
 */

import { AsyncLocalStorage } from 'async_hooks'

export class LocaleProvider {
	private static storage = new AsyncLocalStorage<string>()

	static setLocale(locale: string) {
		this.storage.enterWith(locale)
	}

	static getLocale(): string {
		return this.storage.getStore() || 'en'
	}
}
