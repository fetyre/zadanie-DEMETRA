/**
 * @interface ICreateUser
 * @description Интерфейс для создания нового пользователя.
 * Содержит все необходимые свойства для регистрации нового пользователя в системе.
 */
export interface ICreateUser {
	/**
	 * @property {string} name
	 * @description Имя пользователя.
	 */
	name: string;

	/**
	 * @property {string} email
	 * @description Электронная почта пользователя.
	 */
	email: string;

	/**
	 * @property {string} password
	 * @description Пароль пользователя.
	 */
	password: string;
}
