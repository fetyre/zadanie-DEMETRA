import {
	HttpException,
	HttpStatus,
	Inject,
	Injectable,
	Logger
} from '@nestjs/common';
import { ICreateUser } from './interface';
import { ErrorHandlerService } from '../errro-catch/error-catch.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EntityManager, Repository } from 'typeorm';
import { OptionalUser } from './types/users.types';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ValidateService } from '../validate/validate.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';

/**
 * @constant delayForUserStatusChange
 * @description Задержка перед обновлением статуса пользователя.
 * @type {number}
 */
const delayForUserStatusChange: number = 10000;

/**
 * @constant maxAttemptsForUserStatusChange
 * @description Максимальное количество попыток обновления статуса пользователя.
 * @type {number}
 */
const maxAttemptsForUserStatusChange: number = 3;

/**
 * @constant backoffTypeForUserStatusChange
 * @description Тип отката для обновления статуса пользователя.
 * @type {string}
 */
const backoffTypeForUserStatusChange: string = 'fixed';

/**
 * @constant backoffDelayForUserStatusChange
 * @description Задержка отката для обновления статуса пользователя.
 * @type {number}
 */
const backoffDelayForUserStatusChange: number = 5000;

@Injectable()
export class UsersService {
	private readonly logger: Logger = new Logger(UsersService.name);

	constructor(
		private readonly errorCatch: ErrorHandlerService,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectQueue('users') private mailQueue: Queue,
		private readonly validateService: ValidateService,
		@Inject(CACHE_MANAGER) private cacheManager: Cache
	) {}

	/**
	 * @public
	 * @method create
	 * @descriptionРегистрация Регистрация пользователя.
	 * @param {ICreateUser} createData - Данные для создания нового пользователя.
	 * @returns {Promise<User>} Созданый объект пользователя.
	 * @throws {BadRequestException} Если email адрес уже занят.
	 * @throws {InternalServerErrorException} Если возникла внутренняя ошибка сервера.
	 * @see {@link checkIfEmailExists} Поиск пользователя по email в бд и проверка его наличия.
	 * @see {@link hashPassword} Хэширование пароля.
	 * @see {@link createUserEntity} Создание нового экземпляра сущности.
	 * @see {@link saveUserToDatabase} Сохранение в бд.
	 * @see {@link updateUserStatus} Запуск задачи с задержкой для подтверждения статуса аккаунта.
	 * @see {@link ErrorHandlerService.handleError} Обработчик ошибок в catch.
	 */
	public async create(createData: ICreateUser): Promise<User> {
		try {
			this.logger.log(`Запуск create, email: ${createData.email}.`);
			await this.checkIfEmailExists(createData);
			this.hashPassword(createData);
			return await this.usersRepository.manager.transaction(
				async transactionalEntityManager => {
					const user: User = this.createUserEntity(createData);
					const savedUser: User = await this.saveUserToDatabase(
						transactionalEntityManager,
						user
					);
					await this.updateUserStatus(user);
					return savedUser;
				}
			);
		} catch (error) {
			this.logger.log(
				`Ошибка в create, userId: ${createData.email}, error: ${error.message}.`
			);
			this.errorCatch.handleError(error);
		}
	}

	/**
	 * @private
	 * @method createUserEntity
	 * @descriptionРегистрация Создание нового экземпляра пользователя.
	 * @param {ICreateUser} createData - Данные пользователя.
	 * @returns {User} Новый экземпляр пользователя.
	 */
	private createUserEntity(createData: ICreateUser): User {
		this.logger.log(`Запуск createUserEntity, email: ${createData.email}.`);
		return this.usersRepository.create({
			...createData
		});
	}

	/**
	 * @private
	 * @method saveUserToDatabase
	 * @descriptionРегистрация Сохранение пользователя в базе данных.
	 * @param {EntityManager} transactionalEntityManager - Менеджер транзакций.
	 * @param {User} user - Пользователь для сохранения.
	 * @returns {Promise<User>} Сохраненный пользователь.
	 */
	private async saveUserToDatabase(
		transactionalEntityManager: EntityManager,
		user: User
	): Promise<User> {
		this.logger.log(`Запуск saveUserToDatabase, email: ${user.email}.`);
		return await transactionalEntityManager.save(user);
	}

	/**
	 * @private
	 * @method updateUserStatus
	 * @descriptionРегистрация Добавление задачи обновления статуса пользователя в очередь.
	 * @param {User} user - Пользователь, чей статус нужно обновить.
	 * @returns {Promise<void>} void.
	 */
	private async updateUserStatus(user: User): Promise<void> {
		this.logger.log(`Запуск updateUserStatus, userId: ${user.id}.`);
		await this.mailQueue.add('updateStatus', user, {
			delay: delayForUserStatusChange,
			attempts: maxAttemptsForUserStatusChange,
			backoff: {
				type: backoffTypeForUserStatusChange,
				delay: backoffDelayForUserStatusChange
			}
		});
	}

	/**
	 * @private
	 * @method hashPassword
	 * @descriptionРегистрация Хэширование пароля пользователя.
	 * @param {ICreateUser} createData - Данные пользователя.
	 * @returns {void} void.
	 */
	private hashPassword(createData: ICreateUser): void {
		this.logger.log(`Запуск hashPassword, email: ${createData.email}.`);
		createData.password = crypto
			.createHash('sha256')
			.update(createData.password)
			.digest('hex');
	}

	/**
	 * @private
	 * @method checkIfEmailExists
	 * @descriptionРегистрация Проверка наличия пользователя по email в базе данных.
	 * @param {ICreateUser} createData - Дaнные для проверки свободности email.
	 * @returns {Promise<void>} void.
	 * @throws {BadRequestException} Если email адрес уже занят.
	 * @see {@link findUserByEmail} Поиск пользователя по email в бд.
	 * @see {@link checkIfUserExists} Проверка наличия пользователя.
	 */
	private async checkIfEmailExists(createData: ICreateUser): Promise<void> {
		this.logger.log(`Запуск validateNewUser, email: ${createData.email}.`);
		const user: OptionalUser = await this.findUserByEmail(createData);
		this.checkIfUserExists(user);
	}

	/**
	 * @private
	 * @method findUserByEmail
	 * @descriptionРегистрация Поиск пользователя по email в базе данных.
	 * @param {ICreateUser} createData - Данные для поиска пользователя.
	 * @returns {Promise<OptionalUser>} Найденый объект пользователя или undefined.
	 */
	private async findUserByEmail(
		createData: ICreateUser
	): Promise<OptionalUser> {
		this.logger.log(`Запуск findUserByEmail, email: ${createData.email}.`);
		return await this.usersRepository.findOne({
			where: { email: createData.email }
		});
	}

	/**
	 * @private
	 * @method checkIfUserExists
	 * @descriptionРегистрация Выброс исключения, если пользователь  найден.
	 * @param {OptionalUser} user - Объект пользователя или undefined.
	 * @returns {void} void.
	 * @throws {BadRequestException} Если email адрес уже занят.
	 */
	private checkIfUserExists(user: OptionalUser): void {
		this.logger.log(`Запуск checkIfUserExists.`);
		if (user) {
			throw new HttpException('ERR_USER_EMAIL_EXISTS', HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * @public
	 * @method create
	 * @descriptionРегистрация Поиск пользователя по ID.
	 * @param {string} id - ID пользователя
	 * @returns {Promise<User>} Объект пользователя или ошибка, если пользователь не найден
	 * @throws {BadRequestException} Если пользователь не найден
	 * @throws {InternalServerErrorException} Если возникла внутренняя ошибка сервера
	 * @see {@link ValidateService.checkId} Проверка валидности ID
	 * @see {@link cacheManager.get} Получение пользователя из кэша
	 * @see {@link getUserFromDatabase} Получение пользователя из базы данных, если его нет в кэше
	 * @see {@link errorCatch.handleError} Обработка ошибок
	 */
	public async findUserById(id: string): Promise<User> {
		try {
			this.logger.log(`Запуск findUserById, userId: ${id}.`);
			this.validateService.checkId(id);
			const user: User = await this.cacheManager.get<User>(id);
			if (!user) {
				return await this.getUserFromDatabase(id);
			}
			return user;
		} catch (error) {
			this.logger.log(
				`Ошибка в findUserById, userId: ${id}, error: ${error.message}.`
			);
			this.errorCatch.handleError(error);
		}
	}

	/**
	 * @private
	 * @method getUserFromDatabase
	 * @descriptionРегистрация Получение пользователя из базы данных и сохранение его в кэше.
	 * @param {string} id - ID пользователя.
	 * @returns {Promise<User>} Объект пользователя.
	 * @see {@link findUserInDatabase} - Поиск пользователя в базе данных.
	 */
	private async getUserFromDatabase(id: string): Promise<User> {
		this.logger.log(`Запуск getUserFromDatabase, userId: ${id}.`);
		const user: User = await this.findUserInDatabase(id);
		await this.cacheManager.set(id, user, 1800);
		return user;
	}

	/**
	 * @private
	 * @method findUserInDatabase
	 * @descriptionРегистрация Поиск пользователя в базе данных.
	 * @param {string} id - ID пользователя
	 * @returns {Promise<User>} Объект пользователя
	 * @throws {BadRequestException} Если пользователь не найден
	 * @see {@link findUserByIdInDatabase} Поиск пользователя в базе данных по ID
	 * @see {@link throwIfUserNotFound} Выброс исключения, если пользователь не найден
	 */
	private async findUserInDatabase(id: string): Promise<User> {
		this.logger.log(`Запуск findUserInDatabase, userId: ${id}.`);
		const user: OptionalUser = await this.findUserByIdInDatabase(id);
		this.throwIfUserNotFound(user);
		return user;
	}

	/**
	 * @private
	 * @method throwIfUserNotFound
	 * @descriptionРегистрация Выброс исключения, если пользователь не найден.
	 * @param {OptionalUser} user - Объект пользователя или undefined
	 * @returns {void} void
	 * @throws {BadRequestException} Если пользователь не найден
	 */
	private throwIfUserNotFound(user: OptionalUser): void {
		this.logger.log(`Запуск throwIfUserNotFound.`);
		if (!user) {
			throw new HttpException('ERR_USER_NOT_FOUND', HttpStatus.BAD_REQUEST);
		}
	}

	/**
	 * @private
	 * @method findUserByIdInDatabase
	 * @descriptionРегистрация Поиск пользователя в базе данных по ID.
	 * @param {string} id - ID пользователя
	 * @returns {Promise<OptionalUser>} Объект пользователя или undefined
	 */
	private async findUserByIdInDatabase(id: string): Promise<OptionalUser> {
		this.logger.log(`Запуск findUserByIdInDatabase, userId: ${id}.`);
		return await this.usersRepository.findOne({
			where: { id }
		});
	}
}
