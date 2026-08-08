// Avatar generation service abstraction.
// Swap in a real provider (Ready Player Me, in-house mesh pipeline, …) by
// implementing AvatarGenerationService and registering it below. The UI never
// talks to a provider directly, and never fabricates a finished result.

import { supabase } from "@/integrations/supabase/client";
import { analyzeFacePhoto, type BodySize, type FaceAnalysis, type Gender } from "@/lib/avatar";

export const GENERATION_STAGES = [
  { id: "analyze", label: "Analysing your photo" },
  { id: "body", label: "Building your body from your height & size" },
  { id: "face", label: "Preserving your facial identity" },
  { id: "materials", label: "Rendering realistic skin and hair" },
  { id: "finalize", label: "Placing your avatar on the try-on platform" },
] as const;

export type StageId = (typeof GENERATION_STAGES)[number]["id"];

export interface GenerationRequest {
  photoDataUrl: string;
  gender: Gender;
  bodySize: BodySize;
  heightCm?: number | null;
  /** Caller consent — providers must refuse without it. */
  consent: boolean;
  onStage?: (stage: StageId) => void;
}

/** Try-on ready rig description: segmentation + garment anchors. */
export interface AvatarRig {
  segments: string[];
  garmentAnchors: Record<string, { y: number; radius: number }>;
  supportedCategories: string[];
  pose: "neutral-standing";
}

export interface GeneratedAvatar {
  /** URL of a generated mesh/asset, or null when the provider is parametric. */
  assetUrl: string | null;
  face: FaceAnalysis;
  gender: Gender;
  bodySize: BodySize;
  rig: AvatarRig;
  provider: string;
  /** True while no third-party avatar-generation API is connected. */
  isDemo: boolean;
}

export interface AvatarGenerationService {
  readonly id: string;
  readonly isDemo: boolean;
  generate(req: GenerationRequest): Promise<GeneratedAvatar>;
}

export const TRYON_RIG: AvatarRig = {
  segments: ["head", "neck", "torso", "bust", "waist", "hips", "arms", "legs", "feet"],
  garmentAnchors: {
    shoulder: { y: 1.36, radius: 0.22 },
    chest: { y: 1.18, radius: 0.2 },
    waist: { y: 1.0, radius: 0.17 },
    hip: { y: 0.88, radius: 0.19 },
    knee: { y: 0.42, radius: 0.11 },
    ankle: { y: 0.06, radius: 0.07 },
  },
  supportedCategories: ["saree", "kurti", "lehenga", "dress", "ethnic-set", "western"],
  pose: "neutral-standing",
};

/**
 * Photorealistic provider: sends the uploaded photo to the Tryvior avatar
 * backend, which renders a front-view, full-body human avatar that preserves
 * the person's face, skin tone and proportions.
 */
class PhotorealAvatarProvider implements AvatarGenerationService {
  readonly id = "tryvior-photoreal";
  readonly isDemo = false;

  async generate(req: GenerationRequest): Promise<GeneratedAvatar> {
    if (!req.consent) throw new Error("Consent is required before generating an avatar.");
    req.onStage?.("analyze");
    const face = await analyzeFacePhoto(req.photoDataUrl);
    req.onStage?.("body");

    const { data, error } = await supabase.functions.invoke("generate-avatar", {
      body: {
        photoDataUrl: req.photoDataUrl,
        gender: req.gender,
        bodySize: req.bodySize,
        heightCm: req.heightCm ?? null,
        skinTone: face.skinTone,
      },
    });

    if (error) throw new Error(error.message || "Avatar generation failed. Please try again.");
    if (data?.creditError) throw new Error(data.error || "AI credits exhausted.");
    if (data?.error) throw new Error(data.error);
    const imageUrl: string | undefined = data?.imageUrl;
    if (!imageUrl) throw new Error("No avatar image was returned. Please try a clearer front-facing photo.");

    req.onStage?.("face");
    req.onStage?.("materials");
    req.onStage?.("finalize");

    return {
      assetUrl: imageUrl,
      face,
      gender: req.gender,
      bodySize: req.bodySize,
      rig: TRYON_RIG,
      provider: data?.provider || this.id,
      isDemo: false,
    };
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

let service: AvatarGenerationService = new PhotorealAvatarProvider();

/** Register the production provider once the AI API is connected. */
export function setAvatarGenerationService(next: AvatarGenerationService) {
  service = next;
}

export function getAvatarGenerationService(): AvatarGenerationService {
  return service;
}
