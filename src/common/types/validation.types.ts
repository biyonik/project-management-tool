/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

import { ValidationError, ValidatorOptions } from 'class-validator'

export interface ValidationOptions extends ValidatorOptions {
	transform?: boolean
	transformOptions?: {
		excludeExtraneousValues?: boolean
		exposeUnsetFields?: boolean
	}
}

export interface ValidationContext {
	authService?: any
	[key: string]: any
}

export interface CustomValidator<T = any> {
	(value: T, context?: ValidationContext): void | Promise<void>
}

export interface ValidationErrorFormatter {
	(errors: ValidationError[]): any
}

export interface EnhancedValidationOptions {
	partial?: boolean
	errorFormatter?: ValidationErrorFormatter
	dynamicGroups?: (value: any) => string[]
	validatorOptions?: ValidatorOptions
	customValidators?: CustomValidator[]
	asyncValidators?: CustomValidator[]
	context?: ValidationContext
}
