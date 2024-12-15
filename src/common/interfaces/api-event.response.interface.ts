/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 15/12/2024
 */

import { BaseEvent } from '../events/base/base.event'
import { IApiResponse } from './apiresponse.interface'

export interface IApiEventResponse extends IApiResponse {
	events?: BaseEvent[]
}
