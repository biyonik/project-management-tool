import { FullAuditableEntity } from 'src/modules/entities/base/full-auditable.entity'
import { Entity, Column } from 'typeorm'

@Entity({ name: 'user', comment: 'User table' })
export class UserEntity extends FullAuditableEntity {
	@Column({
		type: 'varchar',
		unique: true,
		nullable: false,
		length: 128,
		comment: 'User email',
		name: 'email',
	})
	email: string

	@Column({
		type: 'varchar',
		nullable: false,
		length: 128,
		select: false,
		name: 'password',
	})
	password: string

	// Contact Information
	@Column({
		nullable: true,
		length: 24,
		comment: 'User phone number',
		name: 'phone_number',
	})
	phoneNumber?: string

	// Profile Information
	@Column({ nullable: true, name: 'profile_picture' })
	profilePicture?: string

	@Column({
		nullable: true,
		length: 500,
		comment: 'User biography',
		name: 'bio',
	})
	bio?: string

	// Address Information
	@Column({
		nullable: true,
		length: 500,
		comment: 'User address',
		name: 'address',
	})
	address?: string

	@Column({ nullable: true, name: 'city' })
	city?: string

	@Column({ nullable: true, name: 'state' })
	state?: string

	@Column({ nullable: true, name: 'zip_code' })
	zipCode?: string

	// Personal Information
	@Column({
		nullable: true,
		length: 128,
		comment: 'User full name',
		name: 'full_name',
	})
	fullName: string

	@Column({
		nullable: true,
		type: 'date',
		comment: 'User date of birth',
		name: 'date_of_birth',
		transformer: {
			to: (value: Date) => value,
			from: (value: string) => new Date(value),
		},
	})
	dateOfBirth?: Date

	// Status Flags
	@Column({
		default: false,
		comment: 'Indicates if user is active',
		name: 'is_active',
	})
	isActive: boolean

	@Column({
		default: false,
		comment: 'Indicates if user is verified',
		name: 'is_verified',
	})
	isVerified: boolean
}
