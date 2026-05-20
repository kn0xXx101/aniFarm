/**
 * Save & share a text document (CSV) using expo-file-system + expo-sharing.
 * Falls back to a browser download on web.
 */
export async function exportTextFile(filename: string, content: string, mimeType: string) {
  if (typeof window !== 'undefined') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return { uri: url };
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
  const FileSystem = require('expo-file-system');
  // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
  const Sharing = require('expo-sharing');
  const uri = `${FileSystem.documentDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, content, { encoding: FileSystem.EncodingType.UTF8 });
  const available = await Sharing.isAvailableAsync();
  if (available) await Sharing.shareAsync(uri, { mimeType });
  return { uri };
}

/** Export HTML as a PDF via expo-print. No-op friendly fallback on web (prints page). */
export async function exportPdf(filename: string, html: string) {
  if (typeof window !== 'undefined') {
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.focus();
      w.print();
    }
    return { uri: '' };
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
  const Print = require('expo-print');
  // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
  const Sharing = require('expo-sharing');
  const { uri } = await Print.printToFileAsync({ html });
  const available = await Sharing.isAvailableAsync();
  if (available) await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: filename });
  return { uri };
}
