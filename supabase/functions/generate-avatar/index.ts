import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { photoDataUrl, gender, heightCm, bodySize, skinTone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!photoDataUrl) throw new Error("A photo is required to build your avatar");

    const heightNote = heightCm ? `${heightCm} cm tall` : "average height";
    const genderNote = gender === "male" ? "man" : "woman";

    const prompt = `Create a PHOTOREALISTIC full-body 3D character render of the EXACT SAME PERSON shown in the reference photo.

IDENTITY LOCK (highest priority):
- Copy the face from the reference photo exactly: face shape, eyes, eyebrows, nose, lips, jawline, hairline, hair colour and hairstyle, facial hair, skin tone and undertone${skinTone ? ` (approx ${skinTone})` : ""}.
- Do NOT beautify, slim, whiten, age, or restyle the person. Do NOT invent a different, generic or "model-like" face.
- The render must be instantly recognisable as this person.

BODY:
- Full body from head to shoes, complete and uncropped, feet visible.
- ${genderNote}, ${heightNote}, body size ${bodySize || "M"} — build the proportions (shoulders, chest, waist, hips, limb length) to match that height and size realistically.

POSE AND FRAMING:
- Simple neutral standing pose, arms relaxed at the sides, weight even, facing the camera FRONT VIEW only.
- No dynamic action, no turning, no side or back view, no props, no phone.
- Standing on a subtle light round studio platform with a soft contact shadow.

STYLE:
- High-end 3D scan / CGI human render quality — realistic skin with pores, realistic hair strands, soft studio lighting, light neutral grey seamless background.
- Wearing plain simple neutral light-grey fitted clothing (simple top and trousers) so garments can be virtually fitted later. No logos, no patterns, no jewellery, no accessories.
- Not cartoonish, not stylised, not anime, not a mannequin without a face.

OUTPUT: one vertical full-body image of this person only.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "text", text: "REFERENCE PHOTO — this is the person whose face and skin tone must be preserved:" },
              { type: "image_url", image_url: { url: photoDataUrl } },
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
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please wait a moment and try again.", rateLimited: true }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    const imageUrl = message?.images?.[0]?.image_url?.url;
    if (!imageUrl) throw new Error("The avatar could not be generated. Please try a clearer front-facing photo.");

    return new Response(JSON.stringify({ imageUrl, provider: "google/gemini-3.1-flash-image" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-avatar error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
