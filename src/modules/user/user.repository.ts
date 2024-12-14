import { Repository } from 'typeorm'
import { BaseRepository } from '../base/repositories/base.repository'
import { UserEntity } from '../entities/domain/user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Injectable } from '@nestjs/common'

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
	constructor(
		@InjectRepository(UserEntity)
		repository: Repository<UserEntity>,
	) {
		super(repository)
	}
}
