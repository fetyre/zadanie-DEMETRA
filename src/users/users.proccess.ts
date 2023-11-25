import { Process, Processor } from '@nestjs/bull';
import { User } from './entities/user.entity';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';

/**
 * @class UsersProcessor
 * @description Класс для обработки заданий, связанных с пользователями.
 * @see {@link updateUserStatus} Обновляет статус пользователя.
 */
@Processor('users')
export class UsersProcessor {
	private readonly logger: Logger = new Logger(UsersProcessor.name);

	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>
	) {}

	/**
	 * @public
	 * @method updateUserStatus
	 * @description Обновляет статус пользователя в базе данных.
	 * @param {Job<User>} job - Задание для обновления статуса пользователя.
	 */
	@Process('updateStatus')
	async updateUserStatus(job: Job<User>): Promise<void> {
		try {
			this.logger.log(`Запуск updateStatus, userId: ${job.data.id}`);
			const user: User = job.data;
			await this.usersRepository.update({ id: user.id }, { status: true });
		} catch (error) {
			this.logger.error(`Ошибка в updateUserStatus, error: ${error.message}`);
		}
	}
}
