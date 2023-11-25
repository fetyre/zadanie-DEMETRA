import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigLoaderService } from '../config/config-loader.service';

/**
 * @class ErrorHandlerService
 * @classdesc Сервис для обработки ошибок.
 * @injectable
 */
@Injectable()
export class ErrorHandlerService {
	private readonly logger: Logger = new Logger(ErrorHandlerService.name);

	constructor(private readonly configLoaderService: ConfigLoaderService) {}

	/**
	 * @public
	 * @method handleError
	 * @description Обработка ошибок.
	 * @param {any} error - Ошибка.
	 * @throws {HttpException} Если ошибка является экземпляром HttpException.
	 * @throws {InternalServerErrorException} Если возникла внутренняя ошибка сервера.
	 */
	public handleError(error: any): void {
		this.logger.error(`Запуск handleError, error: ${error}`);
		if (error instanceof HttpException) {
			throw error;
		}
		this.logger.warn(`Критическкая ошибка, error: ${error}`);
		throw new HttpException(
			`${this.configLoaderService.errorDefaultMessage}`,
			HttpStatus.INTERNAL_SERVER_ERROR
		);
	}
}
