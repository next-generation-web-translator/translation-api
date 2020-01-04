import { OriginalModel } from '../models/original.model';
import { TranslationModel } from '../models/translation.model';

export class SentenceDictEntryModel implements OriginalModel, TranslationModel {
  fingerprint: string;
  pageUri: string;
  paths: Array<string | number>;
  original: string;
  translation: string;
  confidence: number;
}
