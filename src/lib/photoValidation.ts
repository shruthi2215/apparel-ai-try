// Client-side photo quality gate for avatar generation.
// Real measurements (no fake results): face presence, blur, exposure,
// subject coverage and single-subject heuristics.

export type ValidationSeverity = "pass" | "warn" | "fail";

export interface ValidationCheck {
  id: string;
  label: string;
  severity: ValidationSeverity;
  detail: string;
}

export interface PhotoValidationResult {
  ok: boolean;
  checks: ValidationCheck[];
  width: number;
  height: number;
  /** 0..1 confidence that this photo yields a good avatar. */
  score: number;
  faceBox: { x: number; y: number; w: number; h: number } | null;
}

export const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_BYTES = 12 * 1024 * 1024;

export function checkFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type.toLowerCase()))
    return "Use a JPG, JPEG, PNG or WEBP image.";
  if (file.size > MAX_BYTES) return "That image is over 12MB — please use a smaller file.";
  return null;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That file couldn't be read as an image."));
    img.src = src;
  });
}

/** Variance of the Laplacian — the standard sharpness metric. */
function blurVariance(gray: Float32Array, w: number, h: number) {
  let sum = 0, sumSq = 0, n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const lap =
        4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - w] - gray[i + w];
      sum += lap; sumSq += lap * lap; n++;
    }
  }
  const mean = sum / Math.max(n, 1);
  return sumSq / Math.max(n, 1) - mean * mean;
}

interface Region { minX: number; maxX: number; minY: number; maxY: number; count: number }

export async function validatePhoto(dataUrl: string): Promise<PhotoValidationResult> {
  const img = await loadImage(dataUrl);
  const W = 220;
  const H = Math.max(1, Math.round((img.height / Math.max(img.width, 1)) * W));
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Your browser can't process images.");
  ctx.drawImage(img, 0, 0, W, H);
  const { data } = ctx.getImageData(0, 0, W, H);

  const gray = new Float32Array(W * H);
  const skin = new Uint8Array(W * H);
  let bright = 0, skinCount = 0;
  const cols = new Float32Array(W);

  for (let i = 0, p = 0; p < data.length; p += 4, i++) {
    const r = data[p], g = data[p + 1], b = data[p + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    bright += gray[i];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const isSkin =
      r > 60 && g > 35 && b > 18 && r > g && g > b && max - min > 12 && Math.abs(r - g) > 8;
    if (isSkin) { skin[i] = 1; skinCount++; cols[i % W]++; }
  }

  const brightness = bright / (W * H) / 255;
  const sharpness = blurVariance(gray, W, H);
  const skinRatio = skinCount / (W * H);

  // Connected skin regions (4-way flood fill) → largest = primary face/body
  const seen = new Uint8Array(W * H);
  const regions: Region[] = [];
  const stack: number[] = [];
  for (let i = 0; i < W * H; i++) {
    if (!skin[i] || seen[i]) continue;
    let count = 0, minX = W, maxX = 0, minY = H, maxY = 0;
    stack.push(i); seen[i] = 1;
    while (stack.length) {
      const j = stack.pop()!;
      const x = j % W, y = (j - x) / W;
      count++;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      const nb = [x > 0 ? j - 1 : -1, x < W - 1 ? j + 1 : -1, y > 0 ? j - W : -1, y < H - 1 ? j + W : -1];
      for (const k of nb) if (k >= 0 && skin[k] && !seen[k]) { seen[k] = 1; stack.push(k); }
    }
    if (count > (W * H) * 0.004) regions.push({ minX, maxX, minY, maxY, count });
  }
  regions.sort((a, b) => b.count - a.count);
  const primary = regions[0];
  const secondCompeting = regions[1] && regions[1].count > (primary?.count ?? 1) * 0.55;

  const faceBox = primary
    ? {
        x: primary.minX / W,
        y: primary.minY / H,
        w: (primary.maxX - primary.minX) / W,
        h: (primary.maxY - primary.minY) / H,
      }
    : null;

  const checks: ValidationCheck[] = [];
  const add = (id: string, label: string, severity: ValidationSeverity, detail: string) =>
    checks.push({ id, label, severity, detail });

  // Resolution
  if (img.width < 480 || img.height < 640)
    add("resolution", "Resolution", img.width < 320 ? "fail" : "warn",
      `${img.width}×${img.height}px — use at least 480×640 for crisp facial detail.`);
  else add("resolution", "Resolution", "pass", `${img.width}×${img.height}px`);

  // Face visibility
  if (!primary || skinRatio < 0.02)
    add("face", "Face visible", "fail", "We couldn't find a clearly visible face. Face the camera directly, unobstructed.");
  else if (primary.count / (W * H) < 0.045)
    add("face", "Face visible", "warn", "The face looks small in frame — move a little closer.");
  else add("face", "Face visible", "pass", "Face detected and unobstructed.");

  // Subject coverage (how much of the body is in frame)
  const coverage = primary ? (primary.maxY - primary.minY) / H : 0;
  if (primary && coverage < 0.12)
    add("subject", "Person in frame", "warn", "Only a small part of you is visible — include head and torso for better proportions.");
  else add("subject", "Person in frame", "pass", "Enough of you is visible to estimate proportions.");

  // Sharpness
  if (sharpness < 60)
    add("sharpness", "Sharpness", "fail", "The photo is too blurry. Hold still and retake in focus.");
  else if (sharpness < 160)
    add("sharpness", "Sharpness", "warn", "Slightly soft focus — a sharper photo gives better facial detail.");
  else add("sharpness", "Sharpness", "pass", "Sharp and in focus.");

  // Lighting
  if (brightness < 0.2) add("light", "Lighting", "fail", "Too dark. Use even, front-facing light — daylight works best.");
  else if (brightness > 0.9) add("light", "Lighting", "fail", "Overexposed. Avoid strong backlight or direct flash.");
  else if (brightness < 0.32 || brightness > 0.8)
    add("light", "Lighting", "warn", "Lighting is uneven — try softer, more even light.");
  else add("light", "Lighting", "pass", "Well lit and evenly exposed.");

  // Occlusion (skin coverage vs face box fill)
  const fill = primary ? primary.count / Math.max((primary.maxX - primary.minX) * (primary.maxY - primary.minY), 1) : 0;
  if (primary && fill < 0.28)
    add("occlusion", "Occlusion", "warn", "Something may be covering your face — remove masks, hands or sunglasses.");
  else add("occlusion", "Occlusion", "pass", "No heavy occlusion detected.");

  // Single subject
  if (secondCompeting)
    add("single", "One person", "fail", "More than one person appears to be in the photo. Upload a solo photo.");
  else add("single", "One person", "pass", "One primary person detected.");

  const fails = checks.filter((c) => c.severity === "fail").length;
  const warns = checks.filter((c) => c.severity === "warn").length;
  const score = Math.max(0, Math.min(1, 1 - fails * 0.34 - warns * 0.12));

  return { ok: fails === 0, checks, width: img.width, height: img.height, score, faceBox };
}
