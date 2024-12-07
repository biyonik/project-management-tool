/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

// common/decorators/validation/validation.decorators.ts
import { validate } from 'class-validator'
import { ClassConstructor, plainToClass } from 'class-transformer'
import { ValidationException } from '../exceptions/validation.exception'
import {
	EnhancedValidationOptions,
	ValidationOptions,
} from '../types/validation.types'

export function ValidateInput(
	schema: ClassConstructor<any>,
	options: EnhancedValidationOptions = {},
) {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	) {
		const originalMethod = descriptor.value

		descriptor.value = async function (...args: any[]) {
			const inputData = args[0]
			let transformed: any

			// Partial validation desteği
			if (options.partial) {
				transformed = plainToClass(schema, inputData, {
					excludeExtraneousValues: true,
					exposeUnsetFields: false,
				})
			} else {
				transformed = plainToClass(schema, inputData)
			}

			// Validation groups belirleme
			const groups = options.dynamicGroups
				? options.dynamicGroups(inputData)
				: options.validatorOptions?.groups

			// Class-validator validasyonu
			const errors = await validate(transformed, {
				...options.validatorOptions,
				groups,
				whitelist: true,
				forbidNonWhitelisted: true,
			})

			// Custom sync validatorler
			if (options.customValidators) {
				for (const validator of options.customValidators) {
					try {
						await validator(transformed, options.context)
					} catch (error) {
						errors.push(this.convertToValidationError(error))
					}
				}
			}

			// Async validatorler
			if (options.asyncValidators) {
				await Promise.all(
					options.asyncValidators.map(async (validator) => {
						try {
							await validator(transformed, options.context)
						} catch (error) {
							errors.push(this.convertToValidationError(error))
						}
					}),
				)
			}

			// Hata varsa formatlayıp fırlat
			if (errors.length > 0) {
				const formattedErrors = options.errorFormatter
					? options.errorFormatter(errors)
					: this.defaultErrorFormatter(errors)

				throw new ValidationException(formattedErrors)
			}

			// Dönüştürülmüş veriyi kullan
			args[0] = transformed
			return originalMethod.apply(this, args)
		}

		return descriptor
	}
}
export function ValidateOutput(
	schema: ClassConstructor<any>,
	options: ValidationOptions = {},
) {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	) {
		const originalMethod = descriptor.value

		descriptor.value = async function (...args: any[]) {
			const result = await originalMethod.apply(this, args)

			const transformed = plainToClass(
				schema,
				result,
				options.transformOptions,
			)
			const errors = await validate(transformed, options)

			if (errors.length > 0) {
				throw new ValidationException(
					errors,
					'Output validation failed',
				)
			}

			return transformed
		}

		return descriptor
	}
}
