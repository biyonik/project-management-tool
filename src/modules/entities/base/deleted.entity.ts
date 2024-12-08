/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 08/12/2024
 */

import { DeleteDateColumn, Column } from 'typeorm'

export class DeletedColumns {
	@DeleteDateColumn({ name: 'deleted_at', nullable: true })
	deletedAt?: Date

	@Column({ name: 'deleted_by', nullable: true })
	deletedBy?: string
}
