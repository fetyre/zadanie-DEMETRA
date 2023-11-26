import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Res,
	HttpStatus
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Response } from 'express';
import { User } from './entities/user.entity';
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiInternalServerErrorResponse,
	ApiOperation,
	ApiResponse,
	ApiParam
} from '@nestjs/swagger';

@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	@ApiOperation({ summary: 'Регистрация нового пользователя' })
	@ApiBody({
		type: CreateUserDto,
		description: 'Данные для регистрации нового пользователя',
		required: true
	})
	@ApiResponse({
		status: 201,
		description: 'Пользователь успешно создан',
		schema: {
			type: 'object',
			properties: {
				id: {
					type: 'string',
					example: 'ckpfn8skk0000j29z3l9l4d1z'
				},
				email: {
					type: 'string',
					example: 'user@example.com'
				},
				name: {
					type: 'string',
					example: 'Иван Иванов'
				},
				password: {
					type: 'string',
					example: 'хэшированный пароль'
				},
				status: {
					type: 'boolean',
					example: false
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
					example: '2023-11-22T11:15:25.000Z'
				},
				updatedAt: {
					type: 'string',
					format: 'date-time',
					example: '2023-11-22T11:15:25.000Z'
				}
			}
		}
	})
	@ApiBadRequestResponse({
		description:
			'Этот email адрес занят или предоставлены некорректные данные для создания пользователя'
	})
	@ApiInternalServerErrorResponse({
		description: 'Внутренняя ошибка сервера'
	})
	async create(
		@Body() dto: CreateUserDto,
		@Res() res: Response
	): Promise<void> {
		const user: User = await this.usersService.create(dto);
		res.status(HttpStatus.CREATED).json(user);
	}

	@ApiOperation({ summary: 'Получение пользователя по ID' })
	@ApiParam({
		name: 'id',
		description: 'ID пользователя',
		required: true,
		type: 'string'
	})
	@ApiResponse({
		status: 200,
		description: 'Пользователь успешно найден',
		schema: {
			type: 'object',
			properties: {
				statusCode: {
					type: 'number',
					example: 200
				},
				message: {
					type: 'string',
					example: 'SUCCESS'
				},
				user: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							example: 'ckpfn8skk0000j29z3l9l4d1z'
						},
						email: {
							type: 'string',
							example: 'user@example.com'
						},
						name: {
							type: 'string',
							example: 'Иван Иванов'
						},
						password: {
							type: 'string',
							example: 'хэшированный пароль'
						},
						status: {
							type: 'boolean',
							example: false
						},
						createdAt: {
							type: 'string',
							format: 'date-time',
							example: '2023-11-22T11:15:25.000Z'
						},
						updatedAt: {
							type: 'string',
							format: 'date-time',
							example: '2023-11-22T11:15:25.000Z'
						}
					}
				}
			}
		}
	})
	@ApiBadRequestResponse({
		description: 'Пользователь с данным ID не найден'
	})
	@ApiInternalServerErrorResponse({
		description: 'Внутренняя ошибка сервера'
	})
	@Get('get-user-by-id/:id')
	async findOne(@Param('id') id: string, @Res() res: Response): Promise<void> {
		const user: User = await this.usersService.findUserById(id);
		res
			.status(HttpStatus.OK)
			.json({ statusCode: 200, message: 'SUCCESS', user: user });
	}
}
