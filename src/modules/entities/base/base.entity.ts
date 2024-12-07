/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 08/12/2024
 */

import { PrimaryGeneratedColumn } from 'typeorm'

export abstract class BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string
}
