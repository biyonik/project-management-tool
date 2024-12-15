import { Column } from 'typeorm'
import { BaseEntity } from './base.entity'
import { ArchiveStatus } from 'src/common/enums/archive-status.enum'
import { DeletedColumns } from './deleted.entity'

export abstract class ArchivableEntity extends BaseEntity {
	@Column(() => DeletedColumns, { prefix: false })
	deleted: DeletedColumns

	@Column({ name: 'deletion_reason', nullable: true })
	deletionReason?: string

	@Column({
		name: 'archive_status',
		type: 'enum',
		enum: ArchiveStatus,
		default: ArchiveStatus.ACTIVE,
	})
	archiveStatus: ArchiveStatus

	@Column({ name: 'archive_date', nullable: true })
	archiveDate?: Date

	@Column({ name: 'archived_by', nullable: true })
	archivedBy?: string
}
