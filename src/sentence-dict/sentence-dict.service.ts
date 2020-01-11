import { Injectable } from '@nestjs/common';
import { TranslationModel } from '../models/translation.model';
import { OriginalModel } from '../models/original.model';
import { SentencePairEntity } from '../entities/sentence-pair.entity';
import * as leven from 'leven';
import { pick } from 'lodash';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SentenceDict {
  constructor(@InjectRepository(SentencePairEntity) private readonly repository: Repository<SentencePairEntity>) {
  }

  async load(): Promise<SentencePairEntity[]> {
    return this.repository.find();
  }

  async setup(pairs: SentencePairEntity[]): Promise<SentencePairEntity[]> {
    return this.repository.save(pairs);
  }

  async query(id: string): Promise<TranslationModel> {
    return this.repository.findOne(id).then(toTranslationModel);
  }

  async create(original: OriginalModel): Promise<TranslationModel> {
    const result = {
      id: original.id,
      confidence: 0,
      translation: this.translate(original.original),
    };
    await this.repository.save({ ...original, ...result });
    return result;
  }

  fuzzyFind(dict: SentencePairEntity[], original: OriginalModel): SentencePairEntity {
    const sortedEntries = dict
        .map(value => ({ value, confidence: calculateConfidence(original, value) }))
        .sort((v1, v2) => v2.confidence - v1.confidence);
    const mostConfidentEntry = sortedEntries[0];
    return {
      ...original,
      translation: mostConfidentEntry.value.translation,
      confidence: mostConfidentEntry.confidence,
    };
  }

  private translate(html: string) {
    if (html.indexOf('>') !== -1) {
      return html.replace(/>(.*?)</g, '>中$1<');
    } else {
      return '中' + html;
    }
  }

  private async findNearestPair(original: OriginalModel): Promise<SentencePairEntity> {
    const entries = await this.repository.find();
    return this.fuzzyFind(entries, original);
  }
}

function confidenceFromEditDistance(text1: string, text2: string): number {
  const diff = leven(text1, text2);
  const total = Math.max(text1.length, text2.length);
  return 1 - diff / total;
}

function calculateConfidence(original: OriginalModel, dictEntry: SentencePairEntity): number {
  const confidenceOfPageUri = confidenceFromEditDistance(original.pageUri, dictEntry.pageUri);
  const confidenceOfContent = confidenceFromEditDistance(original.original, dictEntry.original);
  const confidenceOfxpath = confidenceFromEditDistance(original.xpath, dictEntry.xpath);

  // TODO: Automatically adjust weights through machine learning
  const weightOfPageUri = 0.25;
  const weightOfxpath = 0.25;
  const weightOfContent = 0.5;

  const confidence = confidenceOfPageUri * weightOfPageUri + confidenceOfContent * weightOfContent + confidenceOfxpath * weightOfxpath;
  return +confidence.toFixed(2);
}

export function toTranslationModel(entry: SentencePairEntity) {
  return entry && pick(entry, ['id', 'confidence', 'translation']);
}
