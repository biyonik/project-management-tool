/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 15/12/2024
 */

import { Injectable } from '@nestjs/common'
import { BaseEvent } from './base/base.event'
import { IEventPublisher } from './event-publisher.interface'
import { IEventHandler } from './event-handler.interface'

@Injectable()
export class EventDispatcher implements IEventPublisher {
	private readonly handlers: Map<string, Set<IEventHandler<BaseEvent>>>

	constructor() {
		this.handlers = new Map()
	}

	registerHandler<T extends BaseEvent>(
		eventType: string,
		handler: IEventHandler<T>,
	): void {
		if (!this.handlers.has(eventType)) {
			this.handlers.set(eventType, new Set())
		}
		this.handlers.get(eventType).add(handler)
	}

	async publish<T extends BaseEvent>(event: T): Promise<void> {
		const handlers = this.handlers.get(event.eventType) || new Set()

		const promises = Array.from(handlers).map((handler) =>
			handler.handle(event).catch((error) => {
				console.error(`Error handling event ${event.eventType}:`, error)
			}),
		)

		await Promise.all(promises)
	}

	async publishAll<T extends BaseEvent>(events: T[]): Promise<void> {
		await Promise.all(events.map((event) => this.publish(event)))
	}
}
