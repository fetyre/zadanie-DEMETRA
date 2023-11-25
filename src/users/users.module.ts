import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BullModule } from '@nestjs/bull';
import { ValidateService } from 'src/validate/validate.service';
import { UsersProcessor } from './users.proccess';

@Module({
	imports: [
		TypeOrmModule.forFeature([User]),
		BullModule.registerQueue({
			name: 'users'
		})
	],
	controllers: [UsersController],
	providers: [UsersService, ValidateService, UsersProcessor]
})
export class UsersModule {}
