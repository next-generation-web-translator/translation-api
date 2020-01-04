import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SentenceDict } from './sentence-dict/sentence-dict.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [SentenceDict],
})
export class AppModule {
}
