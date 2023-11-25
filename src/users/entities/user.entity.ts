import {
	Entity,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	PrimaryColumn
} from 'typeorm';
import * as cuid from '@paralleldrive/cuid2';

/**
 * @class User
 * @description Класс, представляющий пользователя в базе данных.
 */
@Entity()
export class User {
	/**
	 * @description Уникальный идентификатор пользователя.
	 */
	@PrimaryColumn()
	id: string = cuid.createId();

	/**
	 * @description Имя пользователя.
	 */
	@Column({ length: 500 })
	name: string;

	/**
	 * @description Электронная почта пользователя. Должна быть уникальной для каждого пользователя.
	 */
	@Column({ unique: true })
	email: string;

	/**
	 * @description Пароль пользователя.
	 */
	@Column()
	password: string;

	/**
	 * @description Статус пользователя. По умолчанию установлен в false.
	 */
	@Column({ default: false })
	status: boolean;

	/**
	 * @description Дата создания записи пользователя.
	 */
	@CreateDateColumn()
	createdAt: Date;

	/**
	 * @description Дата последнего обновления записи пользователя.
	 */
	@UpdateDateColumn()
	updatedAt: Date;
}
