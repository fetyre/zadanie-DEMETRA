/**
 * @interface IConfig
 * @description Интерфейс для конфигурационных данных.
 */
export interface IConfig {
	lenghtId: number;
	proxuServeId: string;
	proxuServePort: number;
	proxuServeLogin: string;
	proxuServePassword: string;
	errorDefaultMessage: string;
	errorDefaultStatus: number;
	dbHost: string;
	dbPort: number;
	dbUsername: string;
	dbPassword: string;
	dbDatabase: string;
}
