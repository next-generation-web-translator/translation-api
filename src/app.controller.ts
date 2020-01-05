import { Controller, Get, Post, Query } from '@nestjs/common';
import { TranslationModel } from './models/translation.model';
import { OriginalModel } from './models/original.model';
import { MessageBody } from '@nestjs/websockets';
import { SentenceDict } from './sentence-dict/sentence-dict.service';
import { SentencePairEntity } from './entities/sentence-pair.entity';

@Controller()
export class AppController {
  constructor(private readonly dict: SentenceDict) {
  }

  @Get()
  async query(@Query('ids') ids: string): Promise<TranslationModel[]> {
    return this.dict.query(ids.split(','));
  }

  @Post()
  async create(@MessageBody() original: OriginalModel[]): Promise<TranslationModel[]> {
    return this.dict.create(original);
  }

  @Get('setup')
  async setup(): Promise<SentencePairEntity[]> {
    return this.dict.setup([
      {
        id: '1',
        original: 'this is a cup',
        translation: '这是一个杯子',
        pageUri: 'https://angular.io/about',
        xpath: '/p/0',
        confidence: 1,
      },
      {
        id: '2',
        original: 'this is another cup',
        translation: '这是另一个杯子',
        pageUri: 'https://angular.io/about',
        xpath: '/p/1',
        confidence: 1,
      },
    ]);
  }
}
