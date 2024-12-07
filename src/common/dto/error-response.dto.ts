/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

import { IApiResponse } from '../interfaces/apiresponse.interface'

export class ErrorResponse implements IApiResponse {
	success: boolean
	timestamp: string
	error: {
		code: string
		message: string
		details?: any
	}

	constructor(code: string, message: string, details?: any) {
		this.success = false
		this.timestamp = new Date().toISOString()
		this.error = { code, message, details }
	}

	static of(code: string, message: string, details?: any): ErrorResponse {
		return new ErrorResponse(code, message, details)
	}
}
