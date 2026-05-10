import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userImageBase64, productName, productImageUrl, productCategory, selectedColor, userPhotoMimeType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const imageDataUrl = userImageBase64.startsWith("data:")
      ? userImageBase64
      : `data:${userPhotoMimeType || "image/jpeg"};base64,${userImageBase64}`;

    // Fetch product image and convert to base64 data URL so the model receives it as a hard visual reference
    let productImageDataUrl: string | null = null;
    if (productImageUrl) {
      try {
        const r = await fetch(productImageUrl);
        if (r.ok) {
          const buf = new Uint8Array(await r.arrayBuffer());
          let bin = "";
          for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
          const b64 = btoa(bin);
          const mime = r.headers.get("content-type") || "image/jpeg";
          productImageDataUrl = `data:${mime};base64,${b64}`;
        }
      } catch (e) {
        console.error("Failed to fetch product image:", e);
      }
    }

    const colorNote = selectedColor ? ` (color variant: ${selectedColor})` : "";

    const prompt = `You are a virtual try-on engine performing GARMENT TRANSFER, not text-to-image generation.

You receive TWO images:
  IMAGE 1 = the PERSON photo (the user). Preserve everything about this person.
  IMAGE 2 = the EXACT PRODUCT garment "${productName}"${colorNote}, category: ${productCategory || "garment"}. This is the GROUND TRUTH for the clothing.

TASK: Transfer the garment from IMAGE 2 onto the person in IMAGE 1. The output must look like the same person from IMAGE 1 wearing the EXACT garment shown in IMAGE 2.

ABSOLUTE RULES — VIOLATIONS = FAILURE:

1. PRODUCT FIDELITY (HIGHEST PRIORITY) — The garment in the output MUST match IMAGE 2 EXACTLY:
   - Same color and exact shade (no shifts, no "similar" tones)
   - Same print, pattern, motifs, embroidery placement
   - Same neckline shape, sleeve length and style, garment length, silhouette
   - Same fabric texture, sheen, and material appearance
   - Same trims, borders, buttons, zippers, embellishments
   DO NOT redesign, restyle, or "improve" the garment. DO NOT invent details. DO NOT substitute a similar-looking garment. If you cannot faithfully reproduce IMAGE 2, output the validation failure text below.

2. PERSON FIDELITY — Preserve from IMAGE 1: same face, facial features, skin tone, hair, body shape, pose, hand position, and background. ZERO identity changes.

3. ONLY ADAPT: fit to body, drape on the actual pose, lighting/shadow match to IMAGE 1's environment. Nothing else.

4. GARMENT TRANSFER METHOD: Treat this as image-to-image cloth warping. Warp the garment from IMAGE 2 onto the person's body using their pose (shoulders, chest, waist, hips). Blend edges naturally. Do not regenerate the garment from scratch.

5. INDIAN ETHNIC WEAR DRAPING (when applicable, but never altering color/print):
   - Saree: pleats at waist, pallu over shoulder, natural folds — using the EXACT saree fabric from IMAGE 2.
   - Kurti: correct length, side slits, dupatta if shown in IMAGE 2.
   - Lehenga: full flare, proper waistband, natural weight.

6. NO HALOS, no cut-out edges, no color bleeding, no floating fabric. Photorealistic only.

VALIDATION: If IMAGE 1 is not a clear front-facing person photo, OR if you cannot reproduce IMAGE 2's exact color/pattern/structure on the person, respond with TEXT ONLY: "VALIDATION_FAILED: Unable to generate accurate try-on for this product. Please try another image."`;

    const userContent: any[] = [
      { type: "text", text: prompt },
      { type: "text", text: "IMAGE 1 — PERSON (preserve identity, pose, background):" },
      { type: "image_url", image_url: { url: imageDataUrl } },
    ];
    if (productImageDataUrl) {
      userContent.push({ type: "text", text: `IMAGE 2 — EXACT PRODUCT GARMENT to transfer (this is the ground truth for color, pattern, neckline, sleeves, length, fabric):` });
      userContent.push({ type: "image_url", image_url: { url: productImageDataUrl } });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          { role: "user", content: userContent },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage.", creditError: true }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please wait a moment and try again.", rateLimited: true }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    const textContent = message?.content || "";

    if (textContent.includes("VALIDATION_FAILED")) {
      return new Response(
        JSON.stringify({ error: textContent.replace("VALIDATION_FAILED: ", ""), validationFailed: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const generatedImageUrl = message?.images?.[0]?.image_url?.url;

    if (!generatedImageUrl) {
      throw new Error("No image generated from AI model");
    }

    return new Response(JSON.stringify({ imageUrl: generatedImageUrl, description: textContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("ai-tryon-image error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
