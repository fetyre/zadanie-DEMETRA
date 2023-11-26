import { Injectable } from '@nestjs/common';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { ConfigLoaderService } from 'src/config/config-loader.service';
import axios, { AxiosInstance } from 'axios';

// этот класс создает Axios proxy и другие сервисы могут его использовать по документации Axios

/**
 * @class AxiosProxyService
 * @description Сервис для создания экземпляра Axios с настроенным прокси агентом.
 * @see {@link axiosProxy} Создает экземпляр Axios с настроенным прокси агентом.
 * @see {@link createAgent} Создает агента прокси сервера.
 */
@Injectable()
export class AxiosProxyService {
	constructor(private readonly congifLoaderService: ConfigLoaderService) {}

	/**
	 * @public
	 * @method axiosProxy
	 * @description Создает экземпляр Axios с настроенным прокси агентом.
	 * @see {@link createAgent} Создает агента прокси сервера.
	 * @see {@link buildAxiosProxy} Создает экземпляр Axios с настроенным прокси агентом.
	 * @returns {AxiosInstance} Экземпляр Axios с настроенным прокси агентом.
	 */
	public axiosProxy(): AxiosInstance {
		const agent: HttpsProxyAgent<string> = this.createAgent();
		return this.buildAxiosProxy(agent);
	}

	/**
	 * @private
	 * @method createAgent
	 * @description Создает агента прокси-сервера.
	 * @returns {HttpsProxyAgent}  Новый экземпляр HttpsProxyAgent.
	 */
	private createAgent(): HttpsProxyAgent<string> {
		const proxyLogin: string = this.congifLoaderService.proxuServeLogin;
		const proxyPassword: string = this.congifLoaderService.proxuServePassword;
		const proxyId: string = this.congifLoaderService.proxuServeId;
		const proxyPort: number = this.congifLoaderService.proxuServePort;
		const proxyUrl: string = `https://${proxyLogin}:${proxyPassword}@${proxyId}:${proxyPort}`;
		return new HttpsProxyAgent(proxyUrl);
	}

	/**
	 * @private
	 * @method buildAxiosProxy
	 * @description Создает экземпляр Axios с настроенным прокси агентом.
	 * @param {HttpsProxyAgent} httpsAgent - Агент прокси сервера, который используется для запроса.
	 * @returns {AxiosInstance} Экземпляр Axios с настроенным прокси агентом.
	 */
	public buildAxiosProxy(httpsAgent: HttpsProxyAgent<string>): AxiosInstance {
		return axios.create({ httpsAgent });
	}
}
