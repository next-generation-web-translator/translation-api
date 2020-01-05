import { Controller, Get, Header, NotFoundException, Post, Query } from '@nestjs/common';
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
  @Header('Cache-Control', 'public, max-age=3600')
  async query(@Query('id') id: string): Promise<TranslationModel> {
    const result = await this.dict.query(id);
    if (!result) {
      throw new NotFoundException(`${id} not found!`);
    }
    return result;
  }

  @Post()
  async create(@MessageBody() original: OriginalModel): Promise<TranslationModel> {
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
