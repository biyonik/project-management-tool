/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 13/12/2024
 */

import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { LocaleProvider } from './locale.provider'

@Injectable()
export class LocaleInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest()
		const locale = request.params.locale || 'en'

		LocaleProvider.setLocale(locale)
		return next.handle()
	}
}
