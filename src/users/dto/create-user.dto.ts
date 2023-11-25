import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
	IsOptional,
	IsString,
	Length,
	Matches,
	IsEmail,
	IsNotEmpty
} from 'class-validator';
import { ICreateUser } from '../interface';
import { NAME_REGEX, PASSWORD_REGEX } from 'src/common/regex.const';

/**
 * @class CreateUserDto.
 * @classdesc Класс-объект передачи данных для создания нового пользователя.
 * @implements {ICreateUser} Интерфейс, который этот класс реализует.
 * Содержит все необходимые свойства для регистрации нового пользователя в системе.
 */
export class CreateUserDto implements ICreateUser {
	@ApiProperty({
		description: 'Имя пользователя',
		example: 'Иван',
		required: true,
		type: 'string'
	})
	@IsOptional()
	@IsString({ message: 'Имя пользователя должно быть строкой.' })
	@Length(3, 100, {
		message: 'Имя пользователя должно содержать от 3 до 100 символов.'
	})
	@Matches(NAME_REGEX, {
		message:
			'Имя пользователя может содержать только буквы (как заглавные, так и строчные), цифры, апострофы, точки, пробелы и тире.'
	})
	@Transform(({ value }) => value.trim())
	public readonly name!: string;

	@ApiProperty({
		description: 'Электронная почта',
		example: 'ivan@example.com',
		required: true,
		type: 'string'
	})
	@IsString({ message: 'Электронная почта должна быть строкой.' })
	@IsEmail({}, { message: 'Некорректный формат электронной почты.' })
	@Length(5, 255, {
		message: 'Электронная почта должна содержать от 5 до 255 символов.'
	})
	@Matches(/^.+@.+\..+$/, {
		message: 'Электронная почта должна соответствовать формату email.'
	})
	@Transform(params => params.value.toLowerCase())
	public readonly email!: string;

	@ApiProperty({
		description: 'пароль пользователя',
		example: 'Password123!',
		required: true,
		type: 'string'
	})
	@IsString({ message: 'пароль должен быть строкой' })
	@Length(8, 30, { message: 'Минимальная длина пароля должна быть 8 символов' })
	@Matches(PASSWORD_REGEX, {
		message:
			'Для пароля требуется строчная буква, заглавная буква и цифра или символ.'
	})
	@IsNotEmpty({ message: 'Пароль обязательно должен быть заполнен' })
	public password!: string;
}
