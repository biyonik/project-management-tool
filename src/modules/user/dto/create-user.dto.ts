import { Transform } from 'class-transformer'
import {
	IsBoolean,
	IsDate,
	IsEmail,
	IsNotEmpty,
	IsOptional,
	IsPhoneNumber,
	IsString,
	IsStrongPassword,
	Length,
	Matches,
	MaxLength,
} from 'class-validator'

export class CreateUserDto {
	@IsEmail()
	@IsNotEmpty()
	email: string

	@IsStrongPassword()
	@IsNotEmpty()
	@Length(8, 16)
	password: string

	@IsString()
	@Length(2, 128)
	fullName: string

	@IsPhoneNumber()
	@IsOptional()
	phoneNumber?: string

	@IsString()
	@IsOptional()
	@Matches(/^http?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|svg|webp)$/)
	profilePicture?: string

	@IsString()
	@MaxLength(500)
	@IsOptional()
	bio?: string

	@IsString()
	@IsOptional()
	address?: string

	@IsString()
	@IsOptional()
	city?: string

	@IsString()
	@IsOptional()
	state?: string

	@IsString()
	@IsOptional()
	@Matches(/^\d{5}(-\d{4})?$/)
	zipCode?: string

	@IsOptional()
	@IsDate()
	dateOfBirth?: Date

	@IsBoolean()
	@Transform(({ value }) => value ?? false)
	isActive: boolean

	@IsBoolean()
	@Transform(({ value }) => value ?? false)
	isVerified: boolean
}
