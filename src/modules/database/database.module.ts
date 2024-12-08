import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (
				configService: ConfigService,
			): PostgresConnectionOptions => {
				// Debug için config değerlerini loglayalım
				const dbConfig: PostgresConnectionOptions = {
					type: 'postgres',
					host: configService.get('DB_HOST'),
					port: parseInt(configService.get('DB_PORT')),
					username: configService.get('DB_USERNAME'),
					password: configService.get('DB_PASSWORD'),
					database: configService.get('DB_DATABASE'),
					entities: [
						__dirname +
							'/../../modules/entities/domain/*.entity{.ts,.js}',
					],
					migrations: [__dirname + '/../migrations/*{.ts,.js}'],
					synchronize: true,
					logging: true,
					migrationsRun: true,
				}
				return dbConfig
			},
		}),
	],
	exports: [TypeOrmModule],
})
export class DatabaseModule {
	constructor() {
		console.log(__dirname + '/../modules/entities/domain')
	}
}
