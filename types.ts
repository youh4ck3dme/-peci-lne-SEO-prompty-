export enum PromptType {
  Default = 'default',
  New = 'new',
  Urgent = 'urgent',
  Success = 'success',
}

export type Language = 'sk' | 'en';

export interface Prompt {
  id: number;
  icon: string;
  title: { [key in Language]: string };
  timestamp: { [key in Language]: string };
  content: string; // AI prompt content remains in English
  type: PromptType;
}

export interface Settings {
  [key: string]: string;
}
