// Shared garment-transfer prompt + AI call used by both the in-app flow and the public REST API.

export function buildTryOnPrompt(productName: string, productCategory?: string, selectedColor?: string) {
  const colorNote = selectedColor ? ` (color variant: ${selectedColor})` : "";
  return `OBJECTIVE: Perform STRICT GARMENT TRANSFER from IMAGE 2 (product) onto IMAGE 1 (user) with PIXEL-LEVEL FIDELITY. This is NOT text-to-image generation. The garment must remain IDENTICAL to IMAGE 2.

INPUTS:
  IMAGE 1 -> User photo. Preserve face, body, pose, hands, hair, skin tone, background.
  IMAGE 2 -> Product garment "${productName}"${colorNote} (category: ${productCategory || "garment"}). HARD REFERENCE LOCK.

CORE INSTRUCTION:
Transfer the garment from IMAGE 2 onto the person in IMAGE 1. Output = same person from IMAGE 1 wearing the EXACT garment from IMAGE 2.

STRICT RULES (NON-NEGOTIABLE):
- DO NOT redesign, restyle, or reinterpret the garment.
- DO NOT change color, shade, pattern, print, motifs, embroidery, logos, or texture.
- DO NOT modify sleeve type, sleeve length, neckline, garment length, silhouette, or trims.
- DO NOT generate a "similar" outfit — it must be the SAME outfit pixel-for-pixel.
- Preserve face, skin, hair, hands, background of IMAGE 1. Do NOT generate a new person.

TECHNICAL ENFORCEMENT:
- Treat IMAGE 2 as a HARD CONDITIONING INPUT (reference lock, high weight).
- Apply a segmentation mask: replace ONLY the clothing region.
- Warp IMAGE 2's garment to the person's pose. Use LOW denoising on the garment region.

NEGATIVE PROMPT: "new design, different dress, altered pattern, color change, extra embroidery, missing embroidery, sleeve change, neckline change, length change, fashion variation, stylized clothing, similar outfit, reinterpretation, AI redesign, new face, different person".

INDIAN ETHNIC WEAR DRAPING (only if applicable, never altering color/print/structure of IMAGE 2):
- Saree: pleats at waist, pallu over shoulder, EXACT saree fabric from IMAGE 2.
- Kurti / Anarkali: correct length, side slits, dupatta only if present in IMAGE 2.
- Lehenga: full flare, proper waistband, EXACT blouse and dupatta from IMAGE 2.

QUALITY: Photorealistic. No halos, no cut-out edges, no color bleeding, no doubled limbs.

FALLBACK: If IMAGE 1 is not a clear front-facing person photo, OR you cannot reproduce IMAGE 2's exact color/pattern/structure, respond with TEXT ONLY (no image): "VALIDATION_FAILED: Unable to generate accurate try-on for this product. Please try another image."`;
}

export async function fetchImageAsDataUrl(url: string): Promise<string | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const buf = new Uint8Array(await r.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    const mime = r.headers.get("content-type") || "image/jpeg";
    return `data:${mime};base64,${btoa(bin)}`;
  } catch {
    return null;
  }
}

export interface TryOnResult {
  imageUrl?: string;
  description?: string;
  error?: string;
  status: number;
  validationFailed?: boolean;
  rateLimited?: boolean;
  creditError?: boolean;
}

export async function runTryOn(opts: {
  apiKey: string;
  userImageDataUrl: string;
  productImageDataUrl: string | null;
  productName: string;
  productCategory?: string;
  selectedColor?: string;
}): Promise<TryOnResult> {
  const prompt = buildTryOnPrompt(opts.productName, opts.productCategory, opts.selectedColor);
  const userContent: any[] = [
    { type: "text", text: prompt },
    { type: "text", text: "IMAGE 1 — PERSON (preserve identity, pose, background):" },
    { type: "image_url", image_url: { url: opts.userImageDataUrl } },
  ];
  if (opts.productImageDataUrl) {
    userContent.push({ type: "text", text: "IMAGE 2 — EXACT PRODUCT GARMENT to transfer:" });
    userContent.push({ type: "image_url", image_url: { url: opts.productImageDataUrl } });
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${opts.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.1-flash-image",
      messages: [{ role: "user", content: userContent }],
      modalities: ["image", "text"],
    }),
  });

  if (!response.ok) {
    if (response.status === 402) return { status: 402, creditError: true, error: "AI credits exhausted." };
    if (response.status === 429) return { status: 429, rateLimited: true, error: "Rate limited. Please retry shortly." };
    return { status: 502, error: `AI gateway error: ${response.status}` };
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message;
  const textContent = message?.content || "";
  if (textContent.includes("VALIDATION_FAILED")) {
    return { status: 422, validationFailed: true, error: textContent.replace("VALIDATION_FAILED: ", "") };
  }
  const generatedImageUrl = message?.images?.[0]?.image_url?.url;
  if (!generatedImageUrl) return { status: 502, error: "No image generated from AI model" };
  return { status: 200, imageUrl: generatedImageUrl, description: textContent };
}

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}