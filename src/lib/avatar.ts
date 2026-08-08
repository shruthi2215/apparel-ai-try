// Avatar domain logic — kept modular so the placeholder generation step can be
// swapped for a real 3D avatar-generation API later (e.g. Ready Player Me).

export const BODY_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"] as const;
export type BodySize = (typeof BODY_SIZES)[number];
export type Gender = "male" | "female";

export interface FaceAnalysis {
  skinTone: string;          // hex
  brightness: number;        // 0..1
  faceWidthRatio: number;    // rough proportion hint
  jawSoftness: number;       // 0..1
  analyzedAt: string;
}

export interface AvatarRecord {
  id: string;
  user_id: string;
  gender: Gender;
  body_size: BodySize;
  skin_tone: string | null;
  face_data: FaceAnalysis | Record<string, unknown>;
  face_photo_path: string | null;
  avatar_asset_url: string | null;
  consent_given: boolean;
  updated_at: string;
}

/** Body proportion multipliers per size, split per gender template. */
export function bodyMetrics(gender: Gender, size: BodySize) {
  const i = BODY_SIZES.indexOf(size);
  const t = i / (BODY_SIZES.length - 1); // 0..1

  if (gender === "female") {
    return {
      shoulderWidth: 0.62 + t * 0.34,
      chestWidth: 0.58 + t * 0.42,
      waistWidth: 0.46 + t * 0.62,
      hipWidth: 0.66 + t * 0.5,
      depth: 0.42 + t * 0.42,
      limbThickness: 0.085 + t * 0.075,
      height: 1.66 + t * 0.06,
      bust: 0.1 + t * 0.05,
    };
  }
  return {
    shoulderWidth: 0.74 + t * 0.36,
    chestWidth: 0.66 + t * 0.44,
    waistWidth: 0.54 + t * 0.66,
    hipWidth: 0.6 + t * 0.46,
    depth: 0.46 + t * 0.46,
    limbThickness: 0.1 + t * 0.08,
    height: 1.75 + t * 0.06,
    bust: 0,
  };
}

/**
 * Lightweight on-device facial/skin analysis from an uploaded photo.
 * Samples the central face region and returns an averaged skin tone.
 */
export function analyzeFacePhoto(dataUrl: string): Promise<FaceAnalysis> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const w = (canvas.width = 160);
      const h = (canvas.height = 160);
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas unsupported"));
      ctx.drawImage(img, 0, 0, w, h);

      // Central region ≈ face for a typical selfie framing
      const region = ctx.getImageData(w * 0.3, h * 0.22, w * 0.4, h * 0.4).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let p = 0; p < region.length; p += 4) {
        const rr = region[p], gg = region[p + 1], bb = region[p + 2];
        // keep plausible skin pixels
        if (rr > 45 && rr >= gg && gg >= bb * 0.7) { r += rr; g += gg; b += bb; n++; }
      }
      if (n === 0) { n = 1; r = 200; g = 170; b = 150; }
      const avg = [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
      const hex = "#" + avg.map((c) => c.toString(16).padStart(2, "0")).join("");
      const brightness = (avg[0] * 0.299 + avg[1] * 0.587 + avg[2] * 0.114) / 255;

      resolve({
        skinTone: hex,
        brightness: Number(brightness.toFixed(3)),
        faceWidthRatio: Number((img.width / Math.max(img.height, 1)).toFixed(3)),
        jawSoftness: Number((0.4 + brightness * 0.3).toFixed(3)),
        analyzedAt: new Date().toISOString(),
      });
    };
    img.onerror = () => reject(new Error("Could not read that image"));
    img.src = dataUrl;
  });
}

/**
 * Placeholder avatar generation. Returns the asset URL for a generated 3D
 * avatar. Today the preview is rendered live in WebGL from the parameters
 * below; wire a real generation API here without touching the UI flow.
 */
export async function generateAvatarAsset(params: {
  gender: Gender;
  bodySize: BodySize;
  face: FaceAnalysis;
  photoDataUrl: string;
}): Promise<{ assetUrl: string | null; provider: string }> {
  await new Promise((r) => setTimeout(r, 900)); // simulated pipeline latency
  void params;
  return { assetUrl: null, provider: "tryvior-parametric-preview" };
}