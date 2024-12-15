/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 15/12/2024
 */

import { BaseEvent } from './base/base.event'

export interface IEventPublisher {
	publish<T extends BaseEvent>(event: T): Promise<void>
	publishAll<T extends BaseEvent>(events: T[]): Promise<void>
}
