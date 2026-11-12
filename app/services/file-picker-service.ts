import * as DocumentPicker from 'expo-document-picker';
export type PickedFile = {
  bytes: Uint8Array;
  name: string;
};
export class FilePickerService {
  /** `type`: MIME aceito (padrão: qualquer arquivo). */
  async pickFile(type?: string): Promise<PickedFile | undefined> {
    const picked = await DocumentPicker.getDocumentAsync({
      ...(type ? { type } : {}),
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (picked.canceled) {
      return undefined;
    }
    const pickedItem = picked.assets[0];
    const bytes = await pickedItem.file?.arrayBuffer();
    if (!bytes) {
      return undefined;
    }
    return {
      name: pickedItem.name,
      bytes: new Uint8Array(bytes),
    };
  }
}
