import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { HttpService } from '@nestjs/axios';
import { ErrorHandlerService } from 'src/errro-catch/error-catch.service';
import { ConfigLoaderService } from 'src/config/config-loader.service';
import { URL } from 'url';
import { AxiosResponse } from 'axios';

/**
 * @class ProxyRequestService
 * @description Сервис для выполнения HTTP запросов через прокси сервер.
 * @see {@link makeRequest} Выполняет HTTP запрос через прокси сервер.
 * @see {@link createAgent} Создает агента прокси сервера.
 * @see {@link sendRequest} Отправляет HTTP запрос.
 * @see {@link validateUrl} Проверяет является ли URL дрес действительным.
 */
@Injectable()
export class ProxyRequestService {
	private readonly logger: Logger = new Logger(ProxyRequestService.name);

	constructor(
		private readonly httpService: HttpService,
		private readonly errorHandlerService: ErrorHandlerService,
		private readonly congifLoaderService: ConfigLoaderService
	) {}

	/**
	 * @public
	 * @method makeRequest
	 * @description Выполняет HTTP-запрос через прокси-сервер.
	 * @param {string} url - URL-адрес, на который нужно отправить запрос.
	 * @throws {HttpException} Если произошла ошибка при выполнении запроса.
	 * @see {@link createAgent} Создает агента прокси  сервера.
	 * @see {@link sendRequest} Отправляет HTTP запрос.
	 * @see {@link validateUrl} Проверяет является ли URL адрес действительным.
	 */
	async makeRequest(url: string) {
		try {
			this.logger.log(`Запуск makeRequest`);
			this.validateUrl(url);
			const agent: HttpsProxyAgent<string> = this.createAgent();
			const response = await this.sendRequest(url, agent);
		} catch (error) {
			this.logger.error(`Ошибка в makeRequest, error: ${error}`);
			this.errorHandlerService.handleError(error);
		}
	}

	/**
	 * @private
	 * @method createAgent
	 * @description Создает агента прокси-сервера.
	 * @returns {HttpsProxyAgent}  Новый экземпляр HttpsProxyAgent.
	 */
	private createAgent(): HttpsProxyAgent<string> {
		this.logger.log(`Запуск createAgent`);

		const proxyLogin = this.congifLoaderService.proxuServeLogin;
		const proxyPassword = this.congifLoaderService.proxuServePassword;
		const proxyId = this.congifLoaderService.proxuServeId;
		const proxyPort = this.congifLoaderService.proxuServePort;

		const proxyUrl: string = `https://${proxyLogin}:${proxyPassword}@${proxyId}:${proxyPort}`;

		return new HttpsProxyAgent(proxyUrl);
	}

	/**
	 * @private
	 * @method sendRequest
	 * @description Отправляет HTTP-запрос.
	 * @param {string} url - URL адрес на который нужно отправить запрос.
	 * @param {HttpsProxyAgent} agent - Агент прокси сервера  который используется для запроса.
	 * @returns {Promise<AxiosResponse<any>>}  Ответ на HTTP запрос.
	 */
	private async sendRequest(
		url: string,
		agent: HttpsProxyAgent<string>
	): Promise<AxiosResponse<any>> {
		this.logger.log(`Запуск sendRequest`);
		return await lastValueFrom(
			this.httpService.get(url, { httpsAgent: agent })
		);
	}

	/**
	 * @private
	 * @method validateUrl
	 * @description Проверяет является ли URL адрес действительным.
	 * @param {string} url - URL адрес для проверки.
	 * @throws {Error} URL адрес недействителен
	 */
	private validateUrl(url: string): void {
		this.logger.log(`Запуск validateUrl`);
		new URL(url);
	}
}
