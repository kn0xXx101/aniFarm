/**
 * Model versioning registry.
 *
 * Tracks which AI model version is active per farm, supports
 * downloading updated models OTA and rolling back if needed.
 *
 * In production this would integrate with expo-file-system to
 * download .tflite model files from a CDN and swap them in at runtime.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ModelVersion {
  id: string;
  version: string;       // semver e.g. "1.3.0"
  url: string;           // CDN URL for the .tflite file
  checksum: string;      // SHA-256 of the model file
  sizeBytes: number;
  releasedAt: number;
  changelog?: string;
}

export interface FarmModelConfig {
  farmId: string;
  /** null = use global default */
  pinnedVersion: string | null;
  localPath?: string;    // path on device after download
  downloadedAt?: number;
}

const REGISTRY_KEY = 'poultra-model-registry';
const FARM_CONFIG_KEY = 'poultra-farm-model-configs';

/** Global default model — shipped with the app bundle. */
export const BUNDLED_MODEL: ModelVersion = {
  id: 'bundled',
  version: '1.0.0',
  url: '',
  checksum: '',
  sizeBytes: 0,
  releasedAt: 0,
  changelog: 'Multi-class livestock model: alive, dead, human (excluded)',
};

/** Fetch available model versions from the API. */
export async function fetchModelRegistry(): Promise<ModelVersion[]> {
  // In production: GET /models/versions
  // For now return the bundled model as the only available version
  return [BUNDLED_MODEL];
}

/** Get the model config for a specific farm. */
export async function getFarmModelConfig(farmId: string): Promise<FarmModelConfig> {
  try {
    const raw = await AsyncStorage.getItem(`${FARM_CONFIG_KEY}:${farmId}`);
    if (raw) return JSON.parse(raw) as FarmModelConfig;
  } catch {
    // fall through to default
  }
  return { farmId, pinnedVersion: null };
}

/** Pin a specific model version to a farm. */
export async function pinModelVersion(farmId: string, version: string | null): Promise<void> {
  const config: FarmModelConfig = { farmId, pinnedVersion: version };
  await AsyncStorage.setItem(`${FARM_CONFIG_KEY}:${farmId}`, JSON.stringify(config));
}

/** Get the effective model version for a farm (pinned or global default). */
export async function getEffectiveModel(farmId: string): Promise<ModelVersion> {
  const config = await getFarmModelConfig(farmId);
  if (!config.pinnedVersion) return BUNDLED_MODEL;

  const registry = await fetchModelRegistry();
  return registry.find((m) => m.version === config.pinnedVersion) ?? BUNDLED_MODEL;
}

/**
 * Download a model version to local storage.
 * Scaffold — real implementation uses expo-file-system.
 */
export async function downloadModel(
  model: ModelVersion,
  onProgress?: (progress: number) => void,
): Promise<string> {
  if (!model.url) {
    // Bundled model — already available
    onProgress?.(1);
    return 'bundled';
  }

  // const { FileSystem } = await import('expo-file-system');
  // const dest = `${FileSystem.documentDirectory}models/${model.version}.tflite`;
  // const download = FileSystem.createDownloadResumable(model.url, dest, {}, (p) => {
  //   onProgress?.(p.totalBytesWritten / p.totalBytesExpectedToWrite);
  // });
  // await download.downloadAsync();
  // return dest;

  onProgress?.(1);
  return 'bundled';
}
