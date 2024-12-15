/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { EventDispatcher } from '../events/event-dispatcher.service'

@Injectable()
export class EventDispatcherInterceptor implements NestInterceptor {
	constructor(private readonly eventDispatcher: EventDispatcher) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		return next.handle().pipe(
			tap(async (data) => {
				// Response'ta events varsa onları dispatch et
				if (data && Array.isArray(data.events)) {
					await this.eventDispatcher.publishAll(data.events)

					// Events'i response'tan temizle
					delete data.events
				}
			}),
		)
	}
}
