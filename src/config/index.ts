import { IConfig } from './interface/config.interface';

/**
 * @description Функция для получения конфигурационных данных из переменных окружения.
 * @returns {IConfig} Конфигурационные данные.
 */
export function config(): IConfig {
	return {
		lenghtId: parseInt(process.env.LENGTH_ID, 10),
		proxuServeId: process.env.PROXY_SERVE_ID,
		proxuServePort: parseInt(process.env.PROXY_SERVE_PORT, 10),
		proxuServeLogin: process.env.PROXY_SERVE_LOGIN,
		proxuServePassword: process.env.PROXY_SERVE_PASSWORD,
		errorDefaultMessage: process.env.ERROR_DEFAULT_MESSAGE,
		errorDefaultStatus: parseInt(process.env.ERROR_DEFAULT_STATUS, 10),
		dbHost: process.env.DB_HOST,
		dbPort: parseInt(process.env.DB_PORT, 10),
		dbUsername: process.env.DB_USERNAME,
		dbPassword: process.env.DB_PASSWORD,
		dbDatabase: process.env.DB_DATABASE
	};
}
