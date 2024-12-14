/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 08/12/2024
 */

import { Column } from 'typeorm'
import { CreatedColumns } from './created.entity'
import { DeletedColumns } from './deleted.entity'
import { UpdatedColumns } from './updated.entity'
import { ArchivableEntity } from './archivable.entity'

export abstract class FullAuditableEntity extends ArchivableEntity {
	@Column(() => CreatedColumns, { prefix: false })
	created: CreatedColumns

	@Column(() => UpdatedColumns, { prefix: false })
	updated: UpdatedColumns

	@Column(() => DeletedColumns, { prefix: false })
	deleted: DeletedColumns
}
