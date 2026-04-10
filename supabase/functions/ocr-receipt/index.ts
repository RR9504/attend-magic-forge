import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "imageUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      console.error("ANTHROPIC_API_KEY not set");
      return new Response(
        JSON.stringify({ amount: null, error: "OCR not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(imageBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";

    // Call Claude Vision API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: contentType,
                  data: base64Image,
                },
              },
              {
                type: "text",
                text: "This is a receipt image. Extract the total amount (total/summa/att betala) from this receipt. Reply with ONLY the number in SEK (Swedish kronor), no currency symbol, no text. If you cannot read the total amount, reply with just the word NULL.",
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    const textContent = data.content?.[0]?.text?.trim();

    if (!textContent || textContent === "NULL") {
      return new Response(
        JSON.stringify({ amount: null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse the number (handle comma as decimal separator)
    const cleaned = textContent.replace(/\s/g, "").replace(",", ".");
    const amount = parseFloat(cleaned);

    return new Response(
      JSON.stringify({ amount: isNaN(amount) ? null : Math.round(amount * 100) / 100 }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("OCR error:", error);
    return new Response(
      JSON.stringify({ amount: null, error: "OCR processing failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
