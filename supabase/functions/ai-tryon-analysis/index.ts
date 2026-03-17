import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { productName, productPrice } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are an expert AI fashion stylist specialized in Indian fashion and diverse South Asian skin tones and body types. 
    Analyze and provide personalized fashion recommendations. Always respond with a valid JSON object.`;

    const userPrompt = `A customer has selected "${productName}" (₹${productPrice}) for virtual try-on. 
    Based on general South Asian fashion expertise, provide a JSON analysis with this exact structure:
    {
      "skinTone": "descriptive warm/cool/neutral tone name",
      "bodyShape": "body shape type (Hourglass/Rectangle/Pear/Apple/Triangle)",
      "bestFit": "recommended fit description",
      "colorSuggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
      "outfitTips": ["tip 1 specific to ${productName}", "tip 2", "tip 3"],
      "productRecommendations": ["similar product 1", "similar product 2", "similar product 3"]
    }
    Make suggestions specific, actionable, and relevant to Indian fashion trends. Be encouraging and positive.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      // For 402 (credits exhausted) or 429 (rate limit), fall back to smart mock analysis
      if (response.status === 402 || response.status === 429) {
        const fallback = buildFallbackAnalysis(productName);
        return new Response(JSON.stringify({ analysis: fallback }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      analysis = {
        skinTone: "Warm Medium",
        bodyShape: "Hourglass",
        bestFit: "Regular / Semi-fitted",
        colorSuggestions: [
          "Earth tones like terracotta and rust complement warm Indian skin tones beautifully.",
          "Deep jewel tones — burgundy, emerald, navy — give a rich, vibrant look.",
          "Avoid cool pastels which can wash out warm undertones."
        ],
        outfitTips: [
          `${productName} is an excellent choice — the silhouette flatters most Indian body types.`,
          "Pair with statement earrings and minimal makeup for a balanced look.",
          "A fitted dupatta or stole can add elegance and dimension."
        ],
        productRecommendations: [
          "Printed palazzo with similar embroidery",
          "Contrast dupatta in complementary shade",
          "Ethnic block-print kurti in warm tones"
        ]
      };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("ai-tryon-analysis error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
