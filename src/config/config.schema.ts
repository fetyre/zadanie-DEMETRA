import * as Joi from 'joi';

/**
 * @description Схема валидации для проверки конфигурационных данных.
 */
export const validationSchema = Joi.object({
	LENGTH_ID: Joi.number().required(),
	PROXY_SERVE_ID: Joi.string().required(),
	PROXY_SERVE_PORT: Joi.number().required(),
	PROXY_SERVE_LOGIN: Joi.string().required(),
	PROXY_SERVE_PASSWORD: Joi.string().required(),
	ERROR_DEFAULT_MESSAGE: Joi.string().required(),
	ERROR_DEFAULT_STATUS: Joi.string().required(),
	DB_HOST: Joi.string().required(),
	DB_PORT: Joi.number().required(),
	DB_USERNAME: Joi.string().required(),
	DB_PASSWORD: Joi.string().required(),
	DB_DATABASE: Joi.string().required()
});
