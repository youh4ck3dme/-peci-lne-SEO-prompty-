export enum PromptType {
  Default = 'default',
  New = 'new',
  Urgent = 'urgent',
  Success = 'success',
}

export interface Prompt {
  id: number;
  icon: string;
  title: string;
  timestamp: string;
  content: string;
  type: PromptType;
}

export interface Settings {
  [key: string]: string;
}
