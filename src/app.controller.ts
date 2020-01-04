import { Controller, Get, Post, Query } from '@nestjs/common';
import { TranslationModel } from './models/translation.model';
import { OriginalModel } from './models/original.model';
import { MessageBody } from '@nestjs/websockets';
import { SentenceDict } from './sentence-dict/sentence-dict.service';

@Controller()
export class AppController {
  constructor(private readonly dict: SentenceDict) {
  }

  @Get()
  query(@Query('fingerprints') fingerprints: string): TranslationModel[] {
    return this.dict.query(fingerprints.split(','));
  }

  @Post()
  create(@MessageBody() original: OriginalModel[]): TranslationModel[] {
    return this.dict.create(original);
  }
}
