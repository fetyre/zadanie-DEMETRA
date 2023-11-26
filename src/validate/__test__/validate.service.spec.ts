import { Test, TestingModule } from '@nestjs/testing';
import { ValidateService } from '../validate.service';
import { ConfigLoaderService } from '../../config/config-loader.service';

describe('ValidateService', () => {
	let service: ValidateService;

	const validId: string = 'tz4a98xxat96iws9zmbrgj3a';
	const invalidId: string = 'invaвввв%lid-id';

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ValidateService,
				{
					provide: ConfigLoaderService,
					useValue: {
						lenghtId: validId.length
					}
				}
			]
		}).compile();

		service = module.get<ValidateService>(ValidateService);
	});

	describe('checkId', () => {
		it('should not throw an error if id is valid', () => {
			expect(() => service.checkId(validId)).not.toThrow();
		});

		it('should throw an error if id is invalid', () => {
			expect(() => service.checkId(invalidId)).toThrow(
				'Некорректный идентификатор продукта'
			);
		});
	});

	describe('checkIdRegex', () => {
		it('should not throw an error if id matches the regex', () => {
			expect(() => service['checkIdRegex'](validId)).not.toThrow();
		});

		it('should throw an error if id does not match the regex', () => {
			expect(() => service['checkIdRegex'](invalidId)).toThrow(
				'Некорректный идентификатор продукта'
			);
		});
	});

	describe('checkIdLength', () => {
		it('should not throw an error if id length is correct', () => {
			expect(() => service['checkIdLength'](validId)).not.toThrow();
		});

		it('should throw an error if id length is incorrect', () => {
			expect(() => service['checkIdLength'](invalidId)).toThrow(
				'Некорректный идентификатор продукта'
			);
		});
	});
});
