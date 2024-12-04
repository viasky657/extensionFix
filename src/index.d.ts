export enum FileType {
  Unknown = 0,
  File = 1,
  Directory = 2,
  SymbolicLink = 64,
}

export interface IDE {
  getWorkspaceDirs(): Promise<string[]>;
  listDir(dir: string): Promise<[string, FileType][]>;
  pathSep(): Promise<string>;
  readFile(filepath: string): Promise<string>;
}

export interface RangeInFile {
  filepath: string;
  range: Range;
}

export interface MessagePart {
  type: 'text' | 'imageUrl';
  text?: string;
  imageUrl?: { url: string };
}

export type MessageContent = string | MessagePart[];

export type ContextItemUriTypes = 'file' | 'url';

export interface ContextItemUri {
  type: ContextItemUriTypes;
  value: string;
}

export interface ContextItemId {
  providerTitle: string;
  itemId: string;
}

export interface ContextItem {
  content: string;
  name: string;
  description: string;
  editing?: boolean;
  editable?: boolean;
  icon?: string;
  uri?: ContextItemUri;
}

export interface ContextItemWithId extends ContextItem {
  id: ContextItemId;
}
