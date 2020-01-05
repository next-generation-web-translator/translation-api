import { Test, TestingModule } from '@nestjs/testing';
import { SentenceDict, toTranslationModel } from './sentence-dict.service';
import { SentencePairEntity } from '../entities/sentence-pair.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

let dict: SentencePairEntity[];

class MockRepository {
  async findByIds(ids: string[]): Promise<SentencePairEntity[]> {
    return ids.map(id => dict.find(entry => entry.id === id));
  }

  async find(): Promise<SentencePairEntity[]> {
    return dict;
  }

  async save(entities: SentencePairEntity[]): Promise<SentencePairEntity[]> {
    dict.push(...entities);
    return entities;
  }
}

describe('SentenceDictService', () => {
  let service: SentenceDict;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SentenceDict,
        {
          provide: getRepositoryToken(SentencePairEntity),
          useClass: MockRepository,
        },
      ],
    }).compile();

    service = module.get<SentenceDict>(SentenceDict);
    dict = [
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
    ];
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should translate when exact matches', () => {
    const result = service.fuzzyFind(dict, {
      id: '1',
      pageUri: 'https://angular.io/about',
      xpath: '/p/0',
      original: 'this is a cup',
    });

    expect(result.confidence).toBe(1);
    expect(result.translation).toBe('这是一个杯子');
  });

  it('should translate when exact uri and xpath distance', () => {
    const result = service.fuzzyFind(dict, {
      id: '3',
      pageUri: 'https://angular.io/about',
      xpath: '/p/1',
      original: 'this is a cup',
    });

    expect(result.confidence).toBeCloseTo(0.94, 2);
    expect(result.translation).toBe('这是一个杯子');
  });

  it('should query by fingerprints', async () => {
    expect(await service.query(['1', '2'])).toStrictEqual(dict.map(toTranslationModel));
  });

  it('should query by fingerprints, but ignore non-existing entries', async () => {
    expect(await service.query(['1', '2', '3'])).toStrictEqual(dict.map(toTranslationModel));
  });

  it('should create when not exists', async () => {
    await service.create([
      {
        id: '3',
        pageUri: 'https://angular.io/about',
        xpath: '/p/1',
        original: 'this is a cup',
      },
    ]);
    const result = await service.query(['3']);
    expect(result).toStrictEqual([{
      id: '3',
      confidence: 0.94,
      translation: '这是一个杯子',
    }]);
  });
});
