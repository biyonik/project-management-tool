/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 08/12/2024
 */

import { BaseEntity, Column } from 'typeorm'
import { CreatedColumns } from './created.entity'

export abstract class TrackableEntity extends BaseEntity {
	@Column(() => CreatedColumns, { prefix: false })
	created: CreatedColumns
}
