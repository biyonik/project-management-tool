/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

import { IApiResponse } from '../interfaces/apiresponse.interface'

export class SuccessResponse implements IApiResponse {
	success: boolean
	timestamp: string
	message: string

	constructor(message?: string) {
		this.success = true
		this.timestamp = new Date().toISOString()
		this.message = message
	}

	static of(message: string): SuccessResponse {
		return new SuccessResponse(message)
	}
}

export class SuccessDataResponse<T> extends SuccessResponse {
	data: T

	constructor(data: T) {
		super()
		this.data = data
	}

	static of<T>(data: T): SuccessDataResponse<T> {
		return new SuccessDataResponse(data)
	}
}
