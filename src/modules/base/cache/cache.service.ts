import { Injectable, Inject } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Redis } from 'ioredis'

@Injectable()
export class CacheService {
	private readonly keyPrefix: string

	constructor(
		@Inject('REDIS_CLIENT') private readonly redis: Redis,
		private readonly config: ConfigService,
	) {
		this.keyPrefix = `${config.get('APP_NAME')}:${config.get('NODE_ENV')}:`
	}

	private generateKey(key: string): string {
		return `${this.keyPrefix}${key}`
	}

	async get<T>(key: string): Promise<T | null> {
		const data = await this.redis.get(this.generateKey(key))
		return data ? JSON.parse(data) : null
	}

	async set(key: string, value: any, ttl: number = 3600): Promise<void> {
		await this.redis.set(
			this.generateKey(key),
			JSON.stringify(value),
			'EX',
			ttl,
		)
	}
	async delete(key: string): Promise<void> {
		await this.redis.del(key)
	}

	async clear(pattern: string): Promise<void> {
		const keys = await this.redis.keys(pattern)
		if (keys.length > 0) {
			await this.redis.del(...keys)
		}
	}
}
