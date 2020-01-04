import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { SentenceDict } from './sentence-dict/sentence-dict.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [SentenceDict],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.query('')).toBe([]);
    });
  });
});
