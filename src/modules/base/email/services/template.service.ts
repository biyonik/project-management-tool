import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Handlebars from 'handlebars'
import * as fs from 'fs/promises'
import * as path from 'path'
import { MessageSourceService } from 'src/common/i18n/message-source.service'
import { ErrorResponse } from 'src/common/dto/error-response.dto'
import { LocaleProvider } from 'src/common/i18n/locale.provider'

@Injectable()
export class TemplateService {
	private templates: Map<string, HandlebarsTemplateDelegate> = new Map()
	private readonly templateDir: string

	constructor(
		private readonly configService: ConfigService,
		private readonly messageSourceService: MessageSourceService,
	) {
		this.templateDir = this.configService.get(
			'EMAIL_TEMPLATE_DIR',
			'templates/email',
		)
	}

	async loadTemplates(): Promise<void> {
		try {
			const files = await fs.readdir(this.templateDir)
			for (const file of files) {
				if (file.endsWith('.hbs')) {
					const templateName = path.parse(file).name
					const templateContent = await fs.readFile(
						path.join(this.templateDir, file),
						'utf-8',
					)
					this.templates.set(
						templateName,
						Handlebars.compile(templateContent),
					)
				}
			}
		} catch (error) {
			throw new BadRequestException(
				ErrorResponse.of(
					'EMAIL_TEMPLATE_LOAD_FAILED',
					this.messageSourceService.getMessage(
						'email.template.load.failed',
						LocaleProvider.getLocale(),
					),
				),
			)
		}
	}

	async render(
		templateName: string,
		context: Record<string, any>,
	): Promise<string> {
		const template = this.templates.get(templateName)
		if (!template) {
			throw new NotFoundException(`Template '${templateName}' not found`)
		}
		return template(context)
	}
}
