declare module "expo-document-picker" {
  export interface DocumentPickerAsset {
    uri: string;
    name: string;
    size?: number;
    mimeType?: string;
  }
  export interface DocumentPickerSuccessResult {
    canceled: false;
    assets: DocumentPickerAsset[];
  }
  export interface DocumentPickerCanceledResult {
    canceled: true;
    assets: null;
  }
  export type DocumentPickerResult = DocumentPickerSuccessResult | DocumentPickerCanceledResult;

  export interface DocumentPickerOptions {
    type?: string | string[];
    copyToCacheDirectory?: boolean;
    multiple?: boolean;
  }

  export function getDocumentAsync(options?: DocumentPickerOptions): Promise<DocumentPickerResult>;
}
