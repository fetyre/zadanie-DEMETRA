import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './error/global-http-error';
import { ConfigLoaderService } from './config/config-loader.service';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configLoaderService: ConfigLoaderService = app.get(ConfigLoaderService);
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true
		})
	);
	const config = new DocumentBuilder()
		.setTitle('Задание')
		.setDescription('тестовое задание')
		.setVersion('1.0')
		.addTag('zabanie')
		.build();
	app.useGlobalFilters(new HttpExceptionFilter(configLoaderService));
	const document: OpenAPIObject = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);
	await app.listen(3000);
}
bootstrap();
