import { OriginalModel } from '../models/original.model';
import { TranslationModel } from '../models/translation.model';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('sentence_dict')
export class SentencePairEntity implements OriginalModel, TranslationModel {
  @PrimaryColumn()
  id: string;
  @Column()
  pageUri: string;
  @Column()
  xpath: string;
  @Column({ type: 'text' })
  original: string;
  @Column({ type: 'text' })
  translation: string;
  @Column({ precision: 2 })
  confidence: number;
}
