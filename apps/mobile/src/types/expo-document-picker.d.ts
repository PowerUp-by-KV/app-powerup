declare module "expo-document-picker" {
  export type DocumentPickerResult =
    | { type: "cancel" }
    | { type: "success"; uri?: string; name?: string; size?: number };

  export function getDocumentAsync(
    options?: Record<string, unknown>,
  ): Promise<DocumentPickerResult>;

  const DocumentPicker: {
    getDocumentAsync: (options?: Record<string, unknown>) => Promise<DocumentPickerResult>;
  };

  export default DocumentPicker;
}
