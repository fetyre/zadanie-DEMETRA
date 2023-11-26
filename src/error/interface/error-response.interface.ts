import { IErrorPointer } from './error-pointer.interface';

/**
 * @interface IErrorResponse
 * @description Интерфейс для структуры ответа об ошибке.
 */
export interface IErrorResponse {
	status: number;
	source?: IErrorPointer;
	title: string;
	detail: string | object;
}
