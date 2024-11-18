
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
