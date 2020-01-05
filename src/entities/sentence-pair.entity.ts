import { OriginalModel } from '../models/original.model';
import { TranslationModel } from '../models/translation.model';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class SentencePairEntity implements OriginalModel, TranslationModel {
  @PrimaryColumn()
  id: string;
  @Column()
  pageUri: string;
  @Column()
  xpath: string;
  @Column()
  original: string;
  @Column()
  translation: string;
  @Column()
  confidence: number;
}
