import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('audit_logs')
export class AuditLogEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string

	@Column()
	entityType: string

	@Column()
	entityId: string

	@Column()
	action: string

	@Column({ type: 'jsonb', nullable: true })
	oldValues: Record<string, any>

	@Column({ type: 'jsonb', nullable: true })
	newValues: Record<string, any>

	@Column()
	userId: string

	@Column({ type: 'timestamp' })
	timestamp: Date

	@Column({ nullable: true })
	ipAddress: string

	@Column({ nullable: true })
	userAgent: string
}
