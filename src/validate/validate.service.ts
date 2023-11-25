import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ID_REGEX } from '../common/regex.const';
import { ConfigLoaderService } from '../config/config-loader.service';

/**
 * @class ValidateService
 * @description Сервис для проверки валидности данных.
 * @see {@link checkId} Проверяет валидность идентификатора.
 * @see {@link checkIdRegex} Проверяет соответствие идентификатора регулярному выражению.
 * @see {@link checkIdLength} Проверяет длину идентификатора.
 */
@Injectable()
export class ValidateService {
	private readonly logger: Logger = new Logger(ValidateService.name);
	constructor(private readonly configLoaderService: ConfigLoaderService) {}

	/**
	 * @public
	 * @method checkId
	 * @description Проверка идентификатора продукта.
	 * @param {string} id - Идентификатор продукта.
	 * @throws {BadRequestException} Если идентификатор продукта некорректен.
	 * @see {@link checkIdRegex} Проверка идентификатора продукта на соответствие регулярному выражению.
	 * @see {@link checkIdLength} Проверка длины идентификатора продукта.
	 */
	public checkId(id: string): void {
		this.logger.log('Запуск checkId');
		this.checkIdRegex(id);
		this.checkIdLength(id);
	}

	/**
	 * @private
	 * @method checkIdRegex
	 * @description Проверка идентификатора продукта на соответствие регулярному выражению.
	 * @param {string} id - Идентификатор продукта.
	 * @throws {BadRequestException} Если идентификатор продукта не соответствует регулярному выражению.
	 */
	private checkIdRegex(id: string): void {
		this.logger.log('Запуск checkIdRegex');
		const regex: RegExp = new RegExp(ID_REGEX);
		if (!regex.test(id)) {
			throw new HttpException(
				'Некорректный идентификатор продукта',
				HttpStatus.BAD_REQUEST
			);
		}
	}

	/**
	 * @private
	 * @method checkIdLength
	 * @description Проверка длины идентификатора продукта.
	 * @param {string} id - Идентификатор продукта.
	 * @throws {BadRequestException} Если длина идентификатора продукта некорректна.
	 */
	private checkIdLength(id: string): void {
		this.logger.log('Запуск checkIdLength');
		if (id.length !== this.configLoaderService.lenghtId) {
			throw new HttpException(
				'Некорректный идентификатор продукта',
				HttpStatus.BAD_REQUEST
			);
		}
	}
}
