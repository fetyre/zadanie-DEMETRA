import { Module } from '@nestjs/common';
import { ProxyRequestService } from './proxy-request.service';
import { HttpModule } from '@nestjs/axios';

@Module({
	imports: [HttpModule],
	providers: [ProxyRequestService]
})
export class ProxyRequestModule {}
