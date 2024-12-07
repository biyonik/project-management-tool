/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 08/12/2024
 */

import { CreateDateColumn, Column } from 'typeorm'

export class CreatedColumns {
	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date

	@Column({ name: 'created_by', nullable: true })
	createdBy: string
}
