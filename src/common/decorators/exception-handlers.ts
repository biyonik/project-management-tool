/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

export const EXCEPTION_HANDLER_METADATA = 'EXCEPTION_HANDLER_METADATA'

type ExceptionType = new (...args: any[]) => Error

export function ExceptionHandler(exceptionType: ExceptionType) {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	) {
		Reflect.defineMetadata(
			EXCEPTION_HANDLER_METADATA,
			exceptionType,
			target,
			propertyKey,
		)
		return descriptor
	}
}
