import { NestFactory } from '@nestjs/core'
import { AppModule } from './modules/app/app.module'
import { LocaleInterceptor } from './common/i18n/locale.interceptor'
import { I18nValidationPipe } from './common/pipes/i18n-validation.pipe'
import { MessageSourceService } from './common/i18n/message-source.service'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.useGlobalInterceptors(new LocaleInterceptor())
	app.useGlobalPipes(new I18nValidationPipe(new MessageSourceService()))

	await app.listen(3000)
}
bootstrap()
