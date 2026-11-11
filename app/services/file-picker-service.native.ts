import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
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
    const fileBytes = new File(pickedItem.uri).bytes();
    return { name: pickedItem.name, bytes: await fileBytes };
  }
}
