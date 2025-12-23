export interface ProgrammingLanguageDto {
  id: string;
  name: string;
  version: string;
  extra: string;
  iconUrl: string;
  fileExtensions: string;
  interpretor: string;
}

export interface CreateProgrammingLanguageRequest {
  Name: string;
  Version: string;
  Extra: string;
  Icon: File;
  FileExtension: string;
  Interpretor: string;
}

export interface UpdateProgrammingLanguageRequest {
  Name: string;
  Version: string;
  Extra: string;
  Icon: File | null;
  FileExtension: string;
  Interpretor: string;
}
