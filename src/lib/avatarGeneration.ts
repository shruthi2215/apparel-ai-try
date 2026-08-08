// Avatar generation service abstraction.
// Swap in a real provider (Ready Player Me, in-house mesh pipeline, …) by
// implementing AvatarGenerationService and registering it below. The UI never
// talks to a provider directly, and never fabricates a finished result.

import { analyzeFacePhoto, type BodySize, type FaceAnalysis, type Gender } from "@/lib/avatar";

export const GENERATION_STAGES = [
  { id: "analyze", label: "Analysing your photo" },
  { id: "body", label: "Building your body model" },
  { id: "face", label: "Creating facial details" },
  { id: "materials", label: "Generating realistic materials" },
  { id: "finalize", label: "Preparing your Tryvior avatar" },
] as const;

export type StageId = (typeof GENERATION_STAGES)[number]["id"];

export interface GenerationRequest {
  photoDataUrl: string;
  gender: Gender;
  bodySize: BodySize;
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
 * Parametric provider: derives identity signals (skin tone, facial proportion
 * hints) from the real uploaded photo and drives the WebGL body template.
 * Clearly flagged as demo — it does not fabricate a photoreal mesh.
 */
class ParametricAvatarProvider implements AvatarGenerationService {
  readonly id = "tryvior-parametric-preview";
  readonly isDemo = true;

  async generate(req: GenerationRequest): Promise<GeneratedAvatar> {
    if (!req.consent) throw new Error("Consent is required before generating an avatar.");
    req.onStage?.("analyze");
    const face = await analyzeFacePhoto(req.photoDataUrl);
    req.onStage?.("body");
    await wait(700);
    req.onStage?.("face");
    await wait(700);
    req.onStage?.("materials");
    await wait(600);
    req.onStage?.("finalize");
    await wait(500);
    return {
      assetUrl: null,
      face,
      gender: req.gender,
      bodySize: req.bodySize,
      rig: TRYON_RIG,
      provider: this.id,
      isDemo: true,
    };
  }
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

let service: AvatarGenerationService = new ParametricAvatarProvider();

/** Register the production provider once the AI API is connected. */
export function setAvatarGenerationService(next: AvatarGenerationService) {
  service = next;
}

export function getAvatarGenerationService(): AvatarGenerationService {
  return service;
}
