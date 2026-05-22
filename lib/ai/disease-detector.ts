/**
 * Image-based disease suspicion (on-device MVP — replace with TFLite classifier in production).
 */

export type DiseaseKind =
  | 'skin_lesion'
  | 'eye_infection'
  | 'foot_rot'
  | 'parasites'
  | 'wound'
  | 'none';

export interface DiseaseScanResult {
  suspicion: DiseaseKind;
  severity: 'low' | 'medium' | 'high';
  riskScore: number;
  recommendation: string;
  inferenceMs: number;
}

function hashUri(uri: string): number {
  let h = 0;
  for (let i = 0; i < uri.length; i++) h = (h * 31 + uri.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function analyzeDiseaseImage(uri: string): DiseaseScanResult {
  const start = Date.now();
  const h = hashUri(uri) % 100;
  const kinds: DiseaseKind[] = ['none', 'skin_lesion', 'eye_infection', 'foot_rot', 'parasites', 'wound'];
  const suspicion = h < 35 ? 'none' : kinds[1 + (h % (kinds.length - 1))];
  const severity = suspicion === 'none' ? 'low' : h > 70 ? 'high' : h > 50 ? 'medium' : 'low';
  const riskScore = suspicion === 'none' ? 0.08 + (h % 10) / 100 : 0.35 + (h % 50) / 100;

  const recommendations: Record<DiseaseKind, string> = {
    none: 'No obvious lesions in this frame. Re-scan if symptoms persist.',
    skin_lesion: 'Isolate affected animals and consult your vet for topical treatment.',
    eye_infection: 'Check ventilation and ammonia levels; vet may prescribe eye drops.',
    foot_rot: 'Improve pen hygiene and dry bedding; schedule hoof/foot inspection.',
    parasites: 'Consider deworming schedule review and pen sanitation.',
    wound: 'Clean wound, isolate animal, monitor for infection.',
  };

  return {
    suspicion,
    severity,
    riskScore: Math.min(0.99, riskScore),
    recommendation: recommendations[suspicion],
    inferenceMs: Date.now() - start + 120,
  };
}
