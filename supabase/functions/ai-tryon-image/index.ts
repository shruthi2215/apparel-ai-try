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

    const prompt = `OBJECTIVE: Perform STRICT GARMENT TRANSFER from IMAGE 2 (product) onto IMAGE 1 (user) with PIXEL-LEVEL FIDELITY. This is NOT text-to-image generation. The garment must remain IDENTICAL to IMAGE 2.

INPUTS:
  IMAGE 1 → User photo. Preserve face, body, pose, hands, hair, skin tone, background.
  IMAGE 2 → Product garment "${productName}"${colorNote} (category: ${productCategory || "garment"}). HARD REFERENCE LOCK — ground truth for the clothing.

CORE INSTRUCTION:
Transfer the garment from IMAGE 2 onto the person in IMAGE 1. Output = same person from IMAGE 1 wearing the EXACT garment from IMAGE 2 — not a similar one, not a reinterpretation, not a "better" version.

STRICT RULES (NON-NEGOTIABLE — VIOLATIONS = FAILURE):
- DO NOT redesign, restyle, or reinterpret the garment.
- DO NOT change color, shade, pattern, print, motifs, embroidery, or texture.
- DO NOT modify sleeve type, sleeve length, neckline, garment length, silhouette, or trims.
- DO NOT generate a "similar" outfit — it must be the SAME outfit pixel-for-pixel.
- DO NOT add, remove, or rearrange embellishments, buttons, zippers, borders, or dupattas.

TECHNICAL ENFORCEMENT:
- Treat IMAGE 2 as a HARD CONDITIONING INPUT (reference lock, IP-Adapter style, high weight).
- Apply a segmentation mask: replace ONLY the clothing region. Preserve face, skin, hair, hands, background.
- Pose alignment: warp IMAGE 2's garment to the person's pose using shoulders, chest, waist, hips, arms.
- Use LOW denoising strength (≤ 0.4) on the garment region — copy, do not regenerate.
- Use reference-attention with HIGH weight on IMAGE 2.

GARMENT PRESERVATION CONTROLS — LOCK:
- Color histogram of IMAGE 2.
- Texture patterns and weave of IMAGE 2.
- Edge structure, neckline curve, sleeve cuffs, hemline of IMAGE 2.
- Prevent any diffusion outside the garment mask.

NEGATIVE PROMPT (avoid at all costs):
"new design, different dress, altered pattern, color change, color shift, extra embroidery, missing embroidery, sleeve change, neckline change, length change, fashion variation, stylized clothing, similar outfit, reinterpretation, AI redesign".

INDIAN ETHNIC WEAR DRAPING (apply only if applicable, NEVER altering color/print/structure of IMAGE 2):
- Saree: pleats at waist, pallu over shoulder, natural folds — using the EXACT saree fabric from IMAGE 2.
- Kurti / Anarkali: correct length, side slits, dupatta only if present in IMAGE 2.
- Lehenga: full flare, proper waistband, natural weight, EXACT blouse and dupatta from IMAGE 2.

QUALITY: Photorealistic. No halos, no cut-out edges, no color bleeding, no floating fabric, no doubled limbs.

VALIDATION STEP (MANDATORY BEFORE RETURNING):
Compare the generated garment vs IMAGE 2 on:
  (a) color similarity, (b) pattern similarity, (c) shape/silhouette similarity.
If ANY of these mismatch → REJECT the result.

FALLBACK: If IMAGE 1 is not a clear front-facing person photo, OR you cannot reproduce IMAGE 2's exact color/pattern/structure, respond with TEXT ONLY (no image):
"VALIDATION_FAILED: Unable to generate accurate try-on for this product. Please try another image."

SUCCESS CONDITION: The user must be able to say — "This is the EXACT same dress I selected, just on my body."`;

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
