/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

import { Request } from 'express'

declare module 'express-serve-static-core' {
	interface Request {
		user?: {
			id: string
		}
	}
}
