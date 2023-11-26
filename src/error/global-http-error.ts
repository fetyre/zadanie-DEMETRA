import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException
} from '@nestjs/common';
import { Response } from 'express';
import { IErrorResponse } from './interface/error-response.interface';
import { STATUS_CODES } from 'http';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { ConfigLoaderService } from 'src/config/config-loader.service';

/**
 * @class HttpExceptionFilter
 * @description Класс для обработки исключений Http.
 * @see {@link catch} Обрабатывает исключения.
 * @see {@link handleHttpResponse} Обрабатывает HTTP ответ.
 * @see {@link createResponseBody} Создает тело ответа.
 * @see {@link extractErrorMessage} Извлекает сообщение об ошибке.
 * @see {@link extractStatus} Извлекает статус ошибки.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	constructor(private readonly configLoaderService: ConfigLoaderService) {}

	/**
	 * @public
	 * @method catch
	 * @description Обрабатывает исключения.
	 * @param {HttpException} exception - Исключение для обработки.
	 * @param {ArgumentsHost} host - Хост аргументов.
	 */
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx: HttpArgumentsHost = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		this.handleHttpResponse(response, exception, host);
	}

	/**
	 * @private
	 * @method handleHttpResponse
	 * @description Обрабатывает HTTP ответ.
	 * @param {any} response - Ответ для обработки.
	 * @param {HttpException} exception - Исключение для обработки.
	 * @param {ArgumentsHost} host - Хост аргументов.
	 */
	private handleHttpResponse(
		response: any,
		exception: HttpException,
		host: ArgumentsHost
	): void {
		const status: number = this.extractStatus(exception);
		const message: string | object = this.extractErrorMessage(exception);
		const requestUrl = host.switchToHttp().getRequest().url;
		const errorTitle: string = STATUS_CODES[status] || 'Error';
		const responseBody: IErrorResponse = this.createResponseBody(
			status,
			message,
			errorTitle,
			requestUrl
		);
		response.status(status).json(responseBody);
	}

	/**
	 * @private
	 * @method createResponseBody
	 * @description Создает тело ответа.
	 * @param {number} status - Статус ответа.
	 * @param {string | object} message - Сообщение ответа.
	 * @param {string} title - Заголовок ответа.
	 * @param {string} requestUrl - URL запроса.
	 * @returns {IErrorResponse} Тело ответа.
	 */
	private createResponseBody(
		status: number,
		message: string | object,
		title: string,
		requestUrl?: string
	): IErrorResponse {
		return {
			status,
			source: { pointer: requestUrl },
			title,
			detail: message
		};
	}

	/**
	 * @private
	 * @method extractErrorMessage
	 * @description Извлекает сообщение об ошибке из исключения.
	 * @param {HttpException} exception - Исключение для извлечения сообщения.
	 * @returns {string | object} Сообщение об ошибке.
	 */
	private extractErrorMessage(exception: HttpException): string | object {
		return exception instanceof HttpException
			? exception.getResponse()
			: this.configLoaderService.errorDefaultMessage;
	}

	/**
	 * @private
	 * @method extractStatus
	 * @description Извлекает статус из исключения.
	 * @param {HttpException} exception - Исключение для извлечения статуса.
	 * @returns {number} Статус ошибки.
	 */
	private extractStatus(exception: HttpException): number {
		return exception instanceof HttpException
			? exception.getStatus()
			: this.configLoaderService.errorDefaultStatus;
	}
}
