import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ValidateService } from '../../validate/validate.service';
import { ErrorHandlerService } from '../../errro-catch/error-catch.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as dotenv from 'dotenv';
import { ConfigLoaderService } from '../../config/config-loader.service';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

dotenv.config();

describe('UsersService', () => {
	let service: UsersService;
	let repo: Repository<User>;
	let cacheManager: Cache;

	const userData: User = {
		id: 'tz4a98xxat96iws9zmbrgj3a',
		name: 'Ivan Ivanov',
		email: 'ivan@example.com',
		password: 'Password123',
		status: false,
		createdAt: new Date(),
		updatedAt: new Date()
	};

	const mockDto = {
		name: 'Ivan Ivanov',
		email: 'ivan@example.com',
		password: 'Password123'
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
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

		service = module.get<UsersService>(UsersService);
		repo = module.get<Repository<User>>(getRepositoryToken(User));
		cacheManager = module.get<Cache>(CACHE_MANAGER);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should create a user', async () => {
			const user = await service.create(mockDto);
			expect(user).toEqual(userData);
			expect(repo.findOne).toHaveBeenCalledWith({
				where: { email: mockDto.email }
			});
			expect(repo.manager.transaction).toHaveBeenCalledTimes(1);
			expect(repo.create).toHaveBeenCalledWith(mockDto);
		});

		it('should throw an error if user is found', async () => {
			jest.spyOn(repo, 'findOne').mockResolvedValue(userData);
			await expect(service.create(mockDto)).rejects.toThrow(
				'ERR_USER_EMAIL_EXISTS'
			);
		});

		it('should throw an error when findOne is called', async () => {
			jest.spyOn(repo, 'findOne').mockRejectedValue(new Error('Ошибка'));
			await expect(service.create(mockDto)).rejects.toThrow();
		});

		it('should throw an error when hashing password', async () => {
			const createReviewMock = jest.fn(() => {
				throw new Error('ошибка');
			});
			service['hashPassword'] = createReviewMock;
			await expect(service.create(mockDto)).rejects.toThrow();
			expect(repo.findOne).toHaveBeenCalledWith({
				where: { email: mockDto.email }
			});
			expect(repo.findOne).toHaveBeenCalledWith({
				where: { email: mockDto.email }
			});
		});

		it('should throw an error when transaction fails', async () => {
			jest.spyOn(repo.manager, 'transaction').mockImplementation(() => {
				throw new Error('Ошибка');
			});
			await expect(service.create(mockDto)).rejects.toThrow();
			expect(repo.findOne).toHaveBeenCalledWith({
				where: { email: mockDto.email }
			});
		});

		it('should throw an error when create is called', async () => {
			jest.spyOn(repo, 'create').mockImplementation(() => {
				throw new Error('Ошибка');
			});
			await expect(service.create(mockDto)).rejects.toThrow();
			expect(repo.findOne).toHaveBeenCalledWith({
				where: { email: mockDto.email }
			});
		});

		it('should throw an error when save is called', async () => {
			const createReviewMock = jest.fn(() => {
				throw new Error('ошибка');
			});
			service['hashPassword'] = createReviewMock;
			await expect(service.create(mockDto)).rejects.toThrow();
		});

		it('should throw an error when save is called', async () => {
			const createReviewMock = jest.fn(() => {
				throw new Error('ошибка');
			});
			service['updateUserStatus'] = createReviewMock;
			await expect(service.create(mockDto)).rejects.toThrow();
			expect(repo.findOne).toHaveBeenCalledWith({
				where: { email: mockDto.email }
			});
			expect(repo.manager.transaction).toHaveBeenCalledTimes(1);
			expect(repo.create).toHaveBeenCalledWith(mockDto);
		});
	});

	describe('findUserById', () => {
		it('should return a user if found in cache', async () => {
			cacheManager.get = jest.fn().mockResolvedValue(userData);
			const user = await service.findUserById('tz4a98xxat96iws9zmbrgj3a');
			expect(user).toEqual(userData);
			expect(cacheManager.get).toHaveBeenCalledWith(userData.id);
		});

		it('should return a user if found in database but not in cache', async () => {
			jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
			jest.spyOn(repo, 'findOne').mockResolvedValue(userData);
			const user = await service.findUserById(userData.id);
			expect(user).toEqual(userData);
			expect(cacheManager.get).toHaveBeenCalledWith(userData.id);
			expect(repo.findOne).toHaveBeenCalledWith({ where: { id: userData.id } });
		});

		it('should throw an error if user is not found', async () => {
			jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
			await expect(service.findUserById(userData.id)).rejects.toThrow(
				'ERR_USER_NOT_FOUND'
			);
			expect(cacheManager.get).toHaveBeenCalledWith(userData.id);
			expect(repo.findOne).toHaveBeenCalledWith({ where: { id: userData.id } });
		});

		it('should throw an error if validateService.checkId throws an error', async () => {
			jest
				.spyOn(service['validateService'], 'checkId')
				.mockImplementation(() => {
					throw new Error('ошибка');
				});
			await expect(service.findUserById(userData.id)).rejects.toThrow();
		});

		it('should throw an error if cacheManager.get throws an error', async () => {
			cacheManager.get = jest.fn().mockRejectedValue(new Error('ошибка'));
			await expect(service.findUserById(userData.id)).rejects.toThrow();
		});

		it('should throw an error if getUserFromDatabase throws an error', async () => {
			const createReviewMock = jest.fn(() => {
				throw new Error('ошибка');
			});
			service['getUserFromDatabase'] = createReviewMock;
			await expect(service.findUserById(userData.id)).rejects.toThrow();
		});

		it('should throw an error if cacheManager.set throws an error', async () => {
			cacheManager.set = jest.fn().mockRejectedValue(new Error('ошибка'));
			await expect(service.findUserById(userData.id)).rejects.toThrow();
			expect(repo.findOne).toHaveBeenCalledWith({ where: { id: userData.id } });
		});
	});
});
