import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SentenceDict } from './sentence-dict/sentence-dict.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentencePairEntity } from './entities/sentence-pair.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'translation',
      entities: [
        SentencePairEntity,
      ],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([SentencePairEntity]),
  ],
  controllers: [AppController],
  providers: [SentenceDict],
})
export class AppModule {
}
