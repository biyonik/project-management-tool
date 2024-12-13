/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

import { BadRequestException } from '@nestjs/common'
import { ErrorResponse } from 'src/common/dto/error-response.dto'

export function ValidateUniqueEmailForCreate() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	) {
		const originalMethod = descriptor.value

		descriptor.value = async function (...args: any[]) {
			const dto = args[0]
			const userRepository = this.userRepository // this, service instance'ı

			if (!userRepository) {
				throw new Error(
					'UserRepository must be injected in the service',
				)
			}

			const existingUser = await userRepository.findOneBy({
				email: dto.email,
			})
			if (existingUser) {
				throw new BadRequestException(
					ErrorResponse.of(
						'EMAIL_EXISTS',
						`Email '${dto.email}' is already registered`,
						{ email: dto.email },
					),
				)
			}

			return originalMethod.apply(this, args)
		}

		return descriptor
	}
}

export function ValidateUniqueEmailForUpdate() {
	return function (
		target: any,
		propertyKey: string,
		descriptor: PropertyDescriptor,
	) {
		const originalMethod = descriptor.value

		descriptor.value = async function (...args: any[]) {
			const id = args[0]
			const dto = args[1]
			const userRepository = this.userRepository

			if (dto.email) {
				const existingUser = await userRepository.findOneBy({
					email: dto.email,
				})
				if (existingUser && existingUser.id !== id) {
					throw new BadRequestException(
						ErrorResponse.of(
							'EMAIL_EXISTS',
							`Email '${dto.email}' is already in use by another user`,
							{ email: dto.email },
						),
					)
				}
			}

			return originalMethod.apply(this, args)
		}

		return descriptor
	}
}
