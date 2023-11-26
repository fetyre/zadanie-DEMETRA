import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigLoaderService } from '../../config/config-loader.service';
import { ErrorHandlerService } from '../../errro-catch/error-catch.service';
import { ValidateService } from '../../validate/validate.service';
import { ValidationError, validate } from 'class-validator';

describe('UserController', () => {
	let userController: UsersController;
	let userService: UsersService;

	const dto: CreateUserDto = {
		name: 'Иван',
		email: 'ivan@example.com',
		password: 'Password123!'
	};

	const userData: User = {
		id: 'tz4a98xxat96iws9zmbrgj3a',
		name: 'Ivan Ivanov',
		email: 'ivan@example.com',
		password: 'Password123',
		status: false,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				UsersService,
				ErrorHandlerService,
				ValidateService,
				ConfigLoaderService,
				ConfigService,
				{
					provide: getRepositoryToken(User),
					useValue: {
						findOne: jest.fn().mockResolvedValue(null),
						create: jest.fn().mockImplementation(mockDto => mockDto),
						manager: {
							transaction: jest.fn().mockImplementation(async callback => {
								const transactionalEntityManager = {
									save: jest.fn().mockResolvedValue(userData)
								};
								return await callback(transactionalEntityManager);
							})
						}
					}
				},
				{
					provide: 'BullQueue_users',
					useFactory: () => ({
						add: jest.fn()
					})
				},
				{
					provide: CACHE_MANAGER,
					useValue: {
						get: jest.fn(),
						set: jest.fn()
					}
				},
				{
					provide: ValidateService,
					useValue: {
						checkId: jest.fn()
					}
				}
			]
		}).compile();

		userService = module.get<UsersService>(UsersService);
		userController = module.get<UsersController>(UsersController);
	});

	describe('create', () => {
		it('should create a user and return it', async () => {
			jest
				.spyOn(userService, 'create')
				.mockImplementation(() => Promise.resolve(userData));

			const res = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn()
			};

			await userController.create(dto, res as any);
			expect(res.status).toHaveBeenCalledWith(HttpStatus.CREATED);
			expect(res.json).toHaveBeenCalledWith(userData);
		});

		it('should handle errors', async () => {
			const dto: CreateUserDto = {
				name: 'Иван',
				email: 'ivan@example.com',
				password: 'Password123!'
			};
			const error: BadRequestException = new BadRequestException('ошибка');

			jest
				.spyOn(userService, 'create')
				.mockImplementation(() => Promise.reject(error));

			const res = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn()
			};

			try {
				await userController.create(dto, res as any);
			} catch (error) {
				expect(error).toBeInstanceOf(BadRequestException);
				expect(error.message).toBe('ошибка');
			}
		});
	});

	describe('CreateUserDto', () => {
		it('should validate correctly', async () => {
			const errors: ValidationError[] = await validate(
				Object.assign(new CreateUserDto(), dto)
			);
			expect(errors.length).toEqual(0);
		});

		it('should fail validation', async () => {
			const dto: CreateUserDto = {
				name: 'Ив',
				email: 'ivan',
				password: 'pass'
			};

			const errors: ValidationError[] = await validate(
				Object.assign(new CreateUserDto(), dto)
			);
			expect(errors.length).toBeGreaterThan(0);
		});
	});

	describe('findOne', () => {
		it('should find a user and return it', async () => {
			jest
				.spyOn(userService, 'findUserById')
				.mockImplementation(() => Promise.resolve(userData));

			const res = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn()
			};

			await userController.findOne(userData.id, res as any);
			expect(res.status).toHaveBeenCalledWith(HttpStatus.OK);
			expect(res.json).toHaveBeenCalledWith({
				statusCode: 200,
				message: 'SUCCESS',
				user: userData
			});
		});

		it('should handle errors', async () => {
			const error: BadRequestException = new BadRequestException('ошибка');

			jest
				.spyOn(userService, 'findUserById')
				.mockImplementation(() => Promise.reject(error));

			const res = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn()
			};

			try {
				await userController.findOne(userData.id, res as any);
			} catch (error) {
				expect(error).toBeInstanceOf(BadRequestException);
				expect(error.message).toBe('ошибка');
			}
		});
	});
});
