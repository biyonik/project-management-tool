/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

type Constructor<T = any> = new (...args: any[]) => T

// common/exceptions/validation.exception.ts
import { PipeTransform, ArgumentMetadata, Injectable } from '@nestjs/common'
import { validate } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { ValidationException } from '../exceptions/validation.exception'

@Injectable()
export class CustomValidationPipe implements PipeTransform<any> {
	async transform(value: any, { metatype }: ArgumentMetadata) {
		if (!metatype || !this.toValidate(metatype)) {
			return value
		}

		const object = plainToClass(metatype, value)
		const errors = await validate(object)

		console.log('err: ', errors)

		if (errors.length > 0) {
			throw new ValidationException(errors)
		}

		return value
	}

	private toValidate(metatype: Constructor): boolean {
		const types: Constructor[] = [String, Boolean, Number, Array, Object]
		return !types.includes(metatype)
	}
}
