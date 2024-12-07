/**
 * @author Ahmet Altun
 * @version 1.0
 * @email ahmet.altun60@gmail.com
 * @since 07/12/2024
 */

import { registerAs } from '@nestjs/config'

export default registerAs('logger', () => ({
	level: process.env.LOG_LEVEL || 'info',
	directory: process.env.LOG_DIR || 'logs',
	maxFiles: process.env.LOG_MAX_FILES || '14d',
	maxSize: process.env.LOG_MAX_SIZE || '20m',
	consoleLogEnabled: process.env.CONSOLE_LOG_ENABLED === 'true',
}))
