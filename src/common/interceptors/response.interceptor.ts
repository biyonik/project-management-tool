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
import { Observable, map } from 'rxjs'
import { ErrorResponse } from '../dto/error-response.dto'
import { SuccessPaginatedDataResponse } from '../dto/success-paginated-response.dto'
import {
	SuccessResponse,
	SuccessDataResponse,
} from '../dto/success-response.dto'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		return next.handle().pipe(
			map((response) => {
				const httpResponse = context.switchToHttp().getResponse()

				// Zaten bir Response tipinde ise
				if (
					response instanceof SuccessResponse ||
					response instanceof SuccessPaginatedDataResponse ||
					response instanceof ErrorResponse
				) {
					// Error Response ise status code'u ayarla
					if (response instanceof ErrorResponse) {
						httpResponse.status(parseInt(response.error.code))
					}
					return response
				}

				// Normal datayı SuccessDataResponse'a çevir
				return SuccessDataResponse.of(response)
			}),
		)
	}
}
