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

    const prompt = `This is a virtual fashion try-on. The person in this photo wants to see how they would look wearing a "${productName}"${colorNote}. 
    
    Please generate a photorealistic image showing this person wearing the ${productName}${colorNote}. 
    Important requirements:
    - Preserve the person's face, skin tone, and body proportions exactly
    - Keep the original background and lighting
    - Make the clothing look natural with realistic folds and draping
    - Ensure the garment fits the body naturally
    - The result should look like a real photograph, not a composite
    - Maintain the original pose`;

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
      // For 402/429, fall back gracefully: return the user's own photo so the UI still shows a result
      if (response.status === 402 || response.status === 429) {
        console.warn(`AI gateway returned ${response.status} — returning original photo as fallback`);
        return new Response(
          JSON.stringify({
            imageUrl: userImageBase64.startsWith("data:")
              ? userImageBase64
              : `data:${userPhotoMimeType || "image/jpeg"};base64,${userImageBase64}`,
            description: `Demo mode: AI image generation is temporarily unavailable. Showing your original photo with the outfit details for ${productName} in ${selectedColor || "selected color"}.`,
            fallback: true,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    const generatedImageUrl = message?.images?.[0]?.image_url?.url;
    const textContent = message?.content || "Virtual try-on complete!";

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
