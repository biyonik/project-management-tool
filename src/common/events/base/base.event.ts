/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 15/12/2024
 */

export abstract class BaseEvent {
	readonly timestamp: Date
	readonly eventType: string

	constructor() {
		this.timestamp = new Date()
		this.eventType = this.constructor.name
	}
}
