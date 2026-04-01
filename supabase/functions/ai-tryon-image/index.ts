import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userImageBase64, productName, selectedColor, userPhotoMimeType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const imageDataUrl = userImageBase64.startsWith("data:")
      ? userImageBase64
      : `data:${userPhotoMimeType || "image/jpeg"};base64,${userImageBase64}`;

    const colorNote = selectedColor ? ` in ${selectedColor} color` : "";

    const prompt = `You are a virtual fashion try-on engine. Your task is to edit this photo so the person appears to be wearing a "${productName}"${colorNote}.

CRITICAL RULES — follow every one:
1. PRESERVE THE PERSON EXACTLY: same face, skin tone, hair, body shape, pose, proportions, and background. Do NOT generate a new person or model.
2. CLOTHING REPLACEMENT ONLY: Remove the person's current top/outfit and replace it with the "${productName}"${colorNote}. Only modify the clothing region — do NOT touch face, hands, arms skin, or background.
3. BODY-AWARE FIT: The garment must follow the person's actual body contours:
   - Match shoulder width precisely
   - Follow chest/waist/hip curves naturally  
   - Drape and fold realistically based on body shape and pose
   - Sleeve length and neckline should look anatomically correct
4. FABRIC REALISM: Show natural fabric behavior — wrinkles at joints, gravity-based draping, proper creases. No flat or floating clothing.
5. LIGHTING MATCH: The clothing must match the photo's existing lighting direction, shadows, and color temperature. Add natural shadow under collar, at folds, and where fabric meets skin.
6. SEAMLESS EDGES: No visible cut lines, sharp edges, or halo artifacts where clothing meets skin or background.
7. OUTPUT: Photorealistic result that looks like the person actually wore this garment for the photo — NOT a composite or overlay.

If the person is not in a clear front-facing pose or the image quality is too low for accurate try-on, respond with text only: "VALIDATION_FAILED: Please upload a clear front-facing photo with good lighting for accurate try-on results."`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
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

    // Check for validation failure
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
