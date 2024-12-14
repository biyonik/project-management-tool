import {
	BadRequestException,
	ArgumentMetadata,
	PipeTransform,
	Injectable,
	Inject,
} from '@nestjs/common'
import { LocaleProvider } from '../i18n/locale.provider'
import { getValidationMessages } from '../i18n/i18n-validation.message'
import { ErrorResponse } from '../dto/error-response.dto'
import { plainToClass } from 'class-transformer'
import { getMetadataStorage, validate } from 'class-validator'
import { MessageSourceService } from '../i18n/message-source.service'

type Constructor<T = any> = new (...args: any[]) => T

@Injectable()
export class I18nValidationPipe implements PipeTransform<any> {
	constructor(
		@Inject() private readonly messageSourceService: MessageSourceService,
	) {}

	async transform(value: any, { metatype }: ArgumentMetadata) {
		if (!metatype || !this.toValidate(metatype)) {
			return value
		}

		const object = plainToClass(metatype, value)
		const errors = await validate(object)

		if (errors.length > 0) {
			const locale = LocaleProvider.getLocale()
			const messages = getValidationMessages(locale)

			const errorDetails = errors.map((error) => {
				const constraints = error.constraints || {}

				const vals = Object.entries(constraints).map(([key, value]) => {
					let message = messages[key]

					if (key === 'isLength') {
						const validationMetadata =
							getMetadataStorage().getTargetValidationMetadatas(
								metatype.prototype.constructor,
								'',
								false,
								false,
							)

						const lengthValidation = validationMetadata.find(
							(meta) =>
								meta.name === 'isLength' &&
								meta.propertyName === error.property,
						)

						if (lengthValidation?.constraints) {
							const [min, max] = lengthValidation.constraints
							message = message
								.replace('$constraint1', min)
								.replace('$constraint2', max)
						}
					}

					return {
						[key]: message,
					}
				})

				return {
					[error.property]: vals.map(
						(val) => val[Object.keys(val)[0]],
					),
				}
			})

			throw new BadRequestException(
				ErrorResponse.of(
					'VALIDATION_ERROR',
					this.messageSourceService.getMessage(
						'validation.error',
						locale,
					) || 'Validation error',
					errorDetails,
				),
			)
		}

		return value
	}

	private toValidate(metatype: Constructor): boolean {
		const types: Constructor[] = [String, Boolean, Number, Array, Object]
		return !types.includes(metatype)
	}
}
