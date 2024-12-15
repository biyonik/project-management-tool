/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 15/12/2024
 */

import { BaseEvent } from './base/base.event'

export interface IEventHandler<T extends BaseEvent> {
	handle(event: T): Promise<void>
}
