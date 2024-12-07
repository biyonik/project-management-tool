import { FullAuditableEntity } from 'src/modules/entities/base/full-auditable.entity'
import { Entity, Column } from 'typeorm'

@Entity({ name: 'user', comment: 'User table' })
export class UserEntity extends FullAuditableEntity {
	@Column({
		type: 'varchar',
		unique: true,
		length: 128,
		comment: 'User email',
	})
	email: string

	@Column({
		type: 'varchar',
		length: 128,
		select: false,
	})
	password: string

	// Contact Information
	@Column({
		nullable: true,
		length: 24,
		comment: 'User phone number',
	})
	phoneNumber?: string

	// Profile Information
	@Column({ nullable: true })
	profilePicture?: string

	@Column({
		nullable: true,
		length: 500,
		comment: 'User biography',
	})
	bio?: string

	// Address Information
	@Column({
		nullable: true,
		length: 500,
		comment: 'User address',
	})
	address?: string

	@Column({ nullable: true })
	city?: string

	@Column({ nullable: true })
	state?: string

	@Column({ nullable: true })
	zipCode?: string

	// Personal Information
	@Column({
		nullable: true,
		type: 'date',
		comment: 'User date of birth',
	})
	dateOfBirth?: Date

	// Status Flags
	@Column({
		default: false,
		comment: 'Indicates if user is active',
	})
	isActive: boolean

	@Column({
		default: false,
		comment: 'Indicates if user is verified',
	})
	isVerified: boolean
}
