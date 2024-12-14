import { Global, Module } from '@nestjs/common'
import { MessageSourceService } from './message-source.service'

@Global()
@Module({
	providers: [MessageSourceService],
	exports: [MessageSourceService],
})
export class I18nModule {}
