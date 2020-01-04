import { Test, TestingModule } from '@nestjs/testing';
import { SentenceDict, toTranslationModel } from './sentence-dict.service';
import { SentenceDictEntryModel } from '../entities/sentence-dict-entry.model';

const dict: SentenceDictEntryModel[] = [
  {
    fingerprint: '1',
    original: 'this is a cup',
    translation: '这是一个杯子',
    pageUri: 'https://angular.io/about',
    paths: ['p', 0],
    confidence: 1,
  },
  {
    fingerprint: '2',
    original: 'this is another cup',
    translation: '这是另一个杯子',
    pageUri: 'https://angular.io/about',
    paths: ['p', 1],
    confidence: 1,
  },
];

describe('SentenceDictService', () => {
  let service: SentenceDict;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SentenceDict],
    }).compile();

    service = module.get<SentenceDict>(SentenceDict);
    service.load(dict);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should translate when exact matches', () => {
    const result = service.fuzzyFind({
      fingerprint: '1',
      pageUri: 'https://angular.io/about',
      paths: ['p', 0],
      original: 'this is a cup',
    });

    expect(result.confidence).toBe(1);
    expect(result.translation).toBe('这是一个杯子');
  });

  it('should translate when exact uri and paths distance', () => {
    const result = service.fuzzyFind({
      fingerprint: '3',
      pageUri: 'https://angular.io/about',
      paths: ['p', 1],
      original: 'this is a cup',
    });

    expect(result.confidence).toBeCloseTo(0.92, 2);
    expect(result.translation).toBe('这是一个杯子');
  });

  it('should query by fingerprints', () => {
    expect(service.query(['1', '2'])).toStrictEqual(dict.map(toTranslationModel));
  });

  it('should query by fingerprints, but ignore non-existing entries', () => {
    expect(service.query(['1', '2', '3'])).toStrictEqual(dict.map(toTranslationModel));
  });

  it('should create when not exists', () => {
    service.create([
      {
        fingerprint: '3',
        pageUri: 'https://angular.io/about',
        paths: ['p', 1],
        original: 'this is a cup',
      },
    ]);
    const result = service.query(['3']);
    expect(result).toStrictEqual([{
      fingerprint: '3',
      confidence: 0.92,
      translation: '这是一个杯子',
    }]);
  });
});
