/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 13/12/2024
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const Locale = createParamDecorator(
	(data: unknown, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest()
		return request.params.locale || 'en'
	},
)
