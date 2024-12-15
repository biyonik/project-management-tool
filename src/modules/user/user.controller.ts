import {
	Body,
	Controller,
	DefaultValuePipe,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
} from '@nestjs/common'
import { UserService } from './user.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { IApiResponse } from 'src/common/interfaces/apiresponse.interface'
import { ValidIdPipe } from 'src/common/pipes/valid-id.pipe'
import { SortValidationPipe } from 'src/common/pipes/sort-validation.pipe'
import FindAllParams from 'src/common/params/find-all.params'

@Controller(':locale/users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get()
	async getAllUsers(
		@Query(
			'sort',
			new SortValidationPipe(['email', 'createdAt', 'isActive']),
		)
		sort: Array<{ field: string; order: 'ASC' | 'DESC' }>,
		@Query('page') page: number = 1,
		@Query('limit') limit: number = 10,
	): Promise<IApiResponse> {
		const result = await this.userService.findAll({
			sort,
			page,
			limit,
		} as FindAllParams)
		return result
	}

	@Get('id/:id')
	async getById(@Param('id', ValidIdPipe) id: string): Promise<IApiResponse> {
		const result = await this.userService.findById(id)
		return result
	}

	@Post()
	async create(@Body() data: CreateUserDto): Promise<IApiResponse> {
		const result = await this.userService.createUser(data, '')
		return result
	}

	@Patch(':id')
	async update(
		@Param('id', ValidIdPipe) id: string,
		@Body() data: UpdateUserDto,
	): Promise<IApiResponse> {
		const result = await this.userService.update(id, data, '')
		return result
	}

	@Get('active')
	async getActiveUsers(
		@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
		@Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
		@Query('sort', new SortValidationPipe(['email', 'createdAt']))
		sort: Array<{ field: string; order: 'ASC' | 'DESC' }>,
	) {
		return this.userService.findActiveUsers({ page, limit, sort })
	}

	@Delete(':id')
	async deactivateUser(@Param('id', ValidIdPipe) id: string, userId: string) {
		return this.userService.deactivateUser(id, userId)
	}

	@Get(':id/profile')
	async getUserWithProfile(@Param('id', ValidIdPipe) id: string) {
		return this.userService.getUserWithProfile(id)
	}
}
