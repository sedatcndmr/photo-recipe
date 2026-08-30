import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, mimeType } = await request.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `You are an expert photographer. Analyze this image and return ONLY a valid JSON object, no extra text, no markdown:

{
  "title": "Creative recipe name",
  "mood": "One sentence describing the mood",
  "genre": "Photography genre",
  "camera_settings": {
    "estimated_aperture": "e.g. f/1.8",
    "estimated_shutter_speed": "e.g. 1/500s",
    "estimated_iso": "e.g. ISO 400",
    "estimated_focal_length": "e.g. 35mm",
    "white_balance": "e.g. Warm daylight",
    "metering_mode": "e.g. Center-weighted"
  },
  "color_analysis": {
    "dominant_colors": ["#hex1", "#hex2", "#hex3"],
    "color_palette_name": "e.g. Warm Autumn",
    "shadows": "e.g. Lifted blue shadows",
    "highlights": "e.g. Warm golden highlights",
    "midtones": "e.g. Desaturated midtones",
    "overall_tone": "e.g. Warm golden-hour"
  },
  "film_simulation": {
    "analog_film_equivalent": "e.g. Kodak Portra 400",
    "reason": "Why this film stock matches"
  },
  "post_processing": {
    "exposure": "e.g. +0.5",
    "contrast": "e.g. -20",
    "highlights": "e.g. -40",
    "shadows": "e.g. +30",
    "whites": "e.g. -10",
    "blacks": "e.g. +20",
    "texture": "e.g. +10",
    "clarity": "e.g. -15",
    "vibrance": "e.g. -10",
    "saturation": "e.g. -15"
  },
  "camera_recipes": {
    "fujifilm": {
      "film_simulation": "e.g. Classic Chrome / Provia / Velvia / Astia / Eterna",
      "grain_effect": "e.g. Strong Large / Weak Small / Off",
      "color_chrome_effect": "e.g. Strong / Weak / Off",
      "color_chrome_blue": "e.g. Strong / Weak / Off",
      "white_balance": "e.g. Daylight / Shade / Kelvin 4200K",
      "wb_shift_r": "e.g. +3",
      "wb_shift_b": "e.g. -2",
      "highlight_tone": "e.g. -2",
      "shadow_tone": "e.g. +1",
      "color": "e.g. -2",
      "sharpness": "e.g. 0",
      "noise_reduction": "e.g. -4",
      "clarity": "e.g. 0",
      "dynamic_range": "e.g. DR200"
    },
    "sony": {
      "creative_style": "e.g. FL (Flektogon) / Vivid / Neutral / Portrait / Landscape",
      "picture_profile": "e.g. PP8 (S-Cinetone) / PP7 (S-Log2) / Off",
      "contrast": "e.g. -1",
      "saturation": "e.g. -2",
      "sharpness": "e.g. 0",
      "white_balance": "e.g. Daylight / Shade / 4500K",
      "d_range_optimizer": "e.g. Auto / Lv3 / Off"
    },
    "canon": {
      "picture_style": "e.g. Faithful / Neutral / Portrait / Fine Detail",
      "sharpness": "e.g. 3",
      "contrast": "e.g. -2",
      "saturation": "e.g. -1",
      "color_tone": "e.g. 0",
      "white_balance": "e.g. Daylight / Shade / AWB / 4500K",
      "highlight_priority": "e.g. Enable / Disable",
      "auto_lighting_optimizer": "e.g. Disable / Low"
    },
    "nikon": {
      "picture_control": "e.g. Flat / Neutral / Portrait / Landscape",
      "sharpening": "e.g. 3",
      "clarity": "e.g. 0",
      "contrast": "e.g. -2",
      "brightness": "e.g. 0",
      "saturation": "e.g. -1",
      "hue": "e.g. 0",
      "white_balance": "e.g. Direct sunlight / Shade / 4500K",
      "active_d_lighting": "e.g. Off / Normal / High"
    }
  },
  "shooting_tips": ["Tip 1", "Tip 2", "Tip 3"],
  "lightroom_preset_summary": "2-3 sentence summary"
}`,
            },
          ],
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const cleanedText = content.text.trim().replace(/^```json\n?|\n?```$/g, "");
    const recipeData = JSON.parse(cleanedText);

    return NextResponse.json({ recipe: recipeData });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}