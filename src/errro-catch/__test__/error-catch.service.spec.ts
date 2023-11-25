import { HttpException, HttpStatus } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { ConfigLoaderService } from '../../config/config-loader.service';
import { ErrorHandlerService } from '../error-catch.service';

describe('ErrorHandlerService', () => {
	let service: ErrorHandlerService;
	let configLoaderService: ConfigLoaderService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ErrorHandlerService,
				{
					provide: ConfigLoaderService,
					useValue: {
						errorDefaultMessage: 'ошибка'
					}
				}
			]
		}).compile();

		service = module.get<ErrorHandlerService>(ErrorHandlerService);
		configLoaderService = module.get<ConfigLoaderService>(ConfigLoaderService);
	});

	describe('handleError', () => {
		it('should rethrow the error if it is an instance of HttpException', () => {
			const error = new HttpException('ошибка', HttpStatus.BAD_REQUEST);
			expect(() => service.handleError(error)).toThrow(error);
		});

		it('should throw a new InternalServerErrorException if the error is not an instance of HttpException', () => {
			const error = new Error('ошибка');
			expect(() => service.handleError(error)).toThrow(
				new HttpException(
					configLoaderService.errorDefaultMessage,
					HttpStatus.INTERNAL_SERVER_ERROR
				)
			);
		});
	});
});
