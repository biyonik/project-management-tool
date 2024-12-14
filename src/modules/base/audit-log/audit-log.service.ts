import { Inject, Injectable } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { InjectRepository } from '@nestjs/typeorm'
import { AuditLogEntity } from 'src/modules/entities/domain/audit-log.entity'
import { Repository } from 'typeorm'

@Injectable()
export class AuditLogService {
	constructor(
		@InjectRepository(AuditLogEntity)
		private readonly auditLogRepository: Repository<AuditLogEntity>,
		@Inject(REQUEST)
		private readonly request: Request & {
			connection: { remoteAddress: string }
		},
	) {}

	async logChange(params: {
		entityType: string
		entityId: string
		action: string
		oldValues?: Record<string, any>
		newValues?: Record<string, any>
		userId: string
		additionalInfo?: Record<string, any>
	}): Promise<void> {
		const auditLog = this.auditLogRepository.create({
			...params,
			timestamp: new Date(),
			ipAddress: this.request.connection?.remoteAddress || 'unknown',
			userAgent: this.request.headers['user-agent'],
		})

		await this.auditLogRepository.save(auditLog)
	}
}
