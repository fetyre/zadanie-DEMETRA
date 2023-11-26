import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigLoaderModule } from './config/config-loader.module';
import { ValidateModule } from './validate/validate.module';
import { ErrorHandlerModule } from './errro-catch/error-catch.module';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/config.schema';
import { config } from './config';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigLoaderService } from './config/config-loader.service';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validationSchema,
			load: [config]
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: async (configService: ConfigLoaderService) => ({
				type: 'postgres',
				host: configService.dbHost,
				port: configService.dbPort,
				username: configService.dbUsername,
				password: configService.dbPassword,
				database: configService.dbDatabase,
				entities: [__dirname + '/**/*.entity{.ts,.js}'],
				synchronize: true
			}),
			inject: [ConfigLoaderService]
		}),
		BullModule.forRoot({
			redis: {
				host: 'redis',
				port: 6379
			}
		}),
		CacheModule.register({
			isGlobal: true
		}),
		UsersModule,
		ConfigLoaderModule,
		ValidateModule,
		ErrorHandlerModule
	],
	controllers: [],
	providers: []
})
export class AppModule {}
