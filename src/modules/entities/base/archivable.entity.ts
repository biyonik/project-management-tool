import { BaseEntity, Column, DeleteDateColumn } from 'typeorm'

export abstract class ArchivableEntity extends BaseEntity {
	@DeleteDateColumn({ name: 'deleted_at', nullable: true })
	deletedAt?: Date

	@Column({ name: 'deleted_by', nullable: true })
	deletedBy?: string

	@Column({ name: 'deletion_reason', nullable: true })
	deletionReason?: string

	@Column({ name: 'archive_status', default: 'ACTIVE' })
	archiveStatus: 'ACTIVE' | 'ARCHIVED' | 'DELETED'

	@Column({ name: 'archive_date', nullable: true })
	archiveDate?: Date

	@Column({ name: 'archived_by', nullable: true })
	archivedBy?: string
}
