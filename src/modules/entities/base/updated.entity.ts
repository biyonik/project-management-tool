/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 08/12/2024
 */

import { UpdateDateColumn, Column } from 'typeorm'

export class UpdatedColumns {
	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date

	@Column({ name: 'updated_by', nullable: true })
	updatedBy: string
}
