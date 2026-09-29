import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const STYLE_ANALYSIS_PROMPT = `You are an expert visual designer specializing in YouTube thumbnail analysis.

Analyze these YouTube channel thumbnails and extract the visual style patterns. Be specific and detailed.

Return your analysis as JSON with this structure:
{
  "channelStyle": {
    "overallAesthetic": "Brief description of the overall visual style",
    "colorPalette": {
      "primary": ["#hex1", "#hex2"],
      "accent": ["#hex1"],
      "background": ["#hex1", "#hex2"],
      "text": ["#hex1"]
    },
    "typography": {
      "style": "Description of text style (bold, condensed, etc.)",
      "placement": "Where text is typically placed",
      "effects": "Text effects used (shadows, outlines, gradients, etc.)",
      "casing": "UPPERCASE / lowercase / Mixed"
    },
    "composition": {
      "layout": "Description of typical layout patterns",
      "focalPoint": "Where the main focus usually is",
      "backgroundStyle": "How backgrounds are typically handled",
      "facesUsed": true/false,
      "faceExpression": "If faces are used, what expressions"
    },
    "visualElements": {
      "icons": "Common icons or symbols used",
      "overlays": "Any overlays, gradients, or effects",
      "borders": "Border or frame treatments",
      "branding": "Logo or branding placement"
    },
    "mood": "Overall emotional tone",
    "clickbaitLevel": "low / medium / high"
  },
  "patterns": ["List of recurring patterns across thumbnails"],
  "uniqueTraits": ["What makes this channel's thumbnails distinctive"]
}`;

const PROMPT_GENERATION_PROMPT = `You are an expert at crafting image generation prompts for AI tools (Midjourney, DALL-E, Stable Diffusion).

Based on the channel's visual style analysis below, create a detailed image generation prompt for a new YouTube thumbnail on the given topic.

Channel style analysis:
{STYLE_ANALYSIS}

Topic for the new thumbnail:
{TOPIC}

Generate 3 prompt variants:
1. A universal prompt that works in any AI image generator
2. A Midjourney-optimized prompt (with --ar 16:9 and style parameters)
3. A DALL-E optimized prompt (more descriptive, natural language)

For each prompt, maintain the channel's established visual style: same color palette, similar composition, matching mood and typography descriptions.

Return as JSON:
{
  "prompts": [
    {
      "generator": "Universal",
      "prompt": "...",
      "negativePrompt": "..."
    },
    {
      "generator": "Midjourney",
      "prompt": "...",
      "parameters": "--ar 16:9 --v 6 ..."
    },
    {
      "generator": "DALL-E",
      "prompt": "..."
    }
  ],
  "compositionTips": ["Practical tips for composing this specific thumbnail"],
  "textOverlay": {
    "suggested": "Suggested text to overlay",
    "font": "Recommended font style",
    "placement": "Where to place the text",
    "color": "#hex"
  }
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { images, action, styleAnalysis, topic } = body;

    const apiKey = request.headers.get("x-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { error: "Anthropic API key is required" },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey });

    if (action === "analyze") {
      if (!images || images.length === 0) {
        return NextResponse.json(
          { error: "At least one image is required" },
          { status: 400 }
        );
      }

      const imageContent: Anthropic.Messages.ContentBlockParam[] = [];
      for (const img of images.slice(0, 10)) {
        imageContent.push({
          type: "image",
          source: {
            type: "base64",
            media_type: img.mediaType || "image/jpeg",
            data: img.data,
          },
        });
      }
      imageContent.push({ type: "text", text: STYLE_ANALYSIS_PROMPT });

      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content: imageContent }],
      });

      const text = response.content
        .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json(
          { error: "Failed to parse analysis", raw: text },
          { status: 500 }
        );
      }

      return NextResponse.json({ analysis: JSON.parse(jsonMatch[0]) });
    }

    if (action === "generate") {
      if (!styleAnalysis || !topic) {
        return NextResponse.json(
          { error: "Style analysis and topic are required" },
          { status: 400 }
        );
      }

      const prompt = PROMPT_GENERATION_PROMPT
        .replace("{STYLE_ANALYSIS}", JSON.stringify(styleAnalysis, null, 2))
        .replace("{TOPIC}", topic);

      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content
        .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
        .map((b) => b.text)
        .join("");

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return NextResponse.json(
          { error: "Failed to parse prompts", raw: text },
          { status: 500 }
        );
      }

      return NextResponse.json({ result: JSON.parse(jsonMatch[0]) });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
