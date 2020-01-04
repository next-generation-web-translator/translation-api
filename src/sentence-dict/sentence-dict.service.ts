import { Injectable } from '@nestjs/common';
import { TranslationModel } from '../models/translation.model';
import { OriginalModel } from '../models/original.model';
import { SentenceDictEntryModel } from '../entities/sentence-dict-entry.model';
import * as leven from 'leven';
import { pick } from 'lodash';

@Injectable()
export class SentenceDict {
  private dict: SentenceDictEntryModel[] = [];

  query(fingerprints: string[]): TranslationModel[] {
    return fingerprints
        .map(fingerprint => this.dict.find(it => it.fingerprint === fingerprint))
        .filter(entry => !!entry)
        .map(toTranslationModel);
  }

  create(originals: OriginalModel[]): TranslationModel[] {
    return originals
        .map(it => this.fuzzyFind(it))
        .map(entry => this.addEntry(entry))
        .map(toTranslationModel);
  }

  load(dict: SentenceDictEntryModel[]): void {
    this.dict = dict;
  }

  fuzzyFind(original: OriginalModel): SentenceDictEntryModel {
    const sortedEntries = this.dict.map(value => ({ value, confidence: calculateConfidence(original, value) }))
        .sort((v1, v2) => v2.confidence - v1.confidence);
    const mostConfidentEntry = sortedEntries[0];
    return {
      ...original,
      translation: mostConfidentEntry.value.translation,
      confidence: mostConfidentEntry.confidence,
    };
  }

  private addEntry(entry: SentenceDictEntryModel): SentenceDictEntryModel {
    this.dict.push(entry);
    return entry;
  }
}

function confidenceFromEditDistance(text1: string, text2: string): number {
  const diff = leven(text1, text2);
  const total = Math.max(text1.length, text2.length);
  return 1 - diff / total;
}

function calculateConfidence(original: OriginalModel, dictEntry: SentenceDictEntryModel): number {
  const confidenceOfPageUri = confidenceFromEditDistance(original.pageUri, dictEntry.pageUri);
  const confidenceOfContent = confidenceFromEditDistance(original.original, dictEntry.original);
  const confidenceOfPaths = confidenceFromEditDistance(original.paths.join('/'), dictEntry.paths.join('/'));

  // TODO: Automatically adjust weights through machine learning
  const weightOfPageUri = 0.25;
  const weightOfPaths = 0.25;
  const weightOfContent = 0.5;

  const confidence = confidenceOfPageUri * weightOfPageUri + confidenceOfContent * weightOfContent + confidenceOfPaths * weightOfPaths;
  return +confidence.toFixed(2);
}

export function toTranslationModel(entry: SentenceDictEntryModel) {
  return pick(entry, ['fingerprint', 'confidence', 'translation']);
}
