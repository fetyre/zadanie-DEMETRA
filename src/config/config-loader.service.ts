import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * @class ConfigLoaderService
 * @description Сервис для загрузки конфигурационных данных.
 * @see {@link getNumberConfig} Получает числовое значение конфигурации.
 * @see {@link getStringConfig} Получает строковое значение конфигурации.
 */
@Injectable()
export class ConfigLoaderService {
	readonly lenghtId: number;
	readonly proxuServeId: string;
	readonly proxuServePort: number;
	readonly proxuServeLogin: string;
	readonly proxuServePassword: string;
	readonly errorDefaultMessage: string;
	readonly errorDefaultStatus: number;
	readonly dbHost: string;
	readonly dbPort: number;
	readonly dbUsername: string;
	readonly dbPassword: string;
	readonly dbDatabase: string;

	constructor(private readonly configService: ConfigService) {
		this.lenghtId = this.getNumberConfig('lenghtId');
		this.proxuServeId = this.getStringConfig('proxuServeId');
		this.proxuServePort = this.getNumberConfig('proxuServePort');
		this.proxuServeLogin = this.getStringConfig('proxuServeLogin');
		this.proxuServePassword = this.getStringConfig('proxuServePassword');
		this.errorDefaultMessage = this.getStringConfig('errorDefaultMessage');
		this.errorDefaultStatus = this.getNumberConfig('errorDefaultStatus');
		this.dbHost = this.getStringConfig('dbHost');
		this.dbPort = this.getNumberConfig('dbPort');
		this.dbUsername = this.getStringConfig('dbUsername');
		this.dbPassword = this.getStringConfig('dbPassword');
		this.dbDatabase = this.getStringConfig('dbDatabase');
	}

	/**
	 * @private
	 * @method getNumberConfig
	 * @description Получает числовое значение конфигурации.
	 * @param {string} key - Ключ конфигурации.
	 * @returns {number} Числовое значение конфигурации.
	 */
	private getNumberConfig(key: string): number {
		return this.configService.get<number>(key);
	}

	/**
	 * @private
	 * @method getStringConfig
	 * @description Получает строковое значение конфигурации.
	 * @param {string} key - Ключ конфигурации.
	 * @returns {string} Строковое значение конфигурации.
	 */
	private getStringConfig(key: string): string {
		return this.configService.get<string>(key);
	}
}
