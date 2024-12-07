/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

import { LogOrder } from '../enums/log-order.enum'

export interface LogMetadata {
	message: string
	context?: any
	order: LogOrder
	evaluateContext?: boolean
}
