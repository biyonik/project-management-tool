import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserEntity } from '../entities/domain/user.entity'
import { CacheModule } from '../base/cache/cache.module'
import { UserRepository } from './user.repository'

@Module({
	controllers: [UserController],
	providers: [UserRepository, UserService],
	imports: [TypeOrmModule.forFeature([UserEntity]), CacheModule],
})
export class UserModule {}
