import { Global, Module } from '@nestjs/common'
import { MessageSourceService } from './message-source.service'
import { LocaleInterceptor } from './locale.interceptor'
import { LocaleProvider } from './locale.provider'

@Global()
@Module({
	providers: [MessageSourceService, LocaleProvider, LocaleInterceptor],
	exports: [LocaleProvider, MessageSourceService],
})
export class I18nModule {}
