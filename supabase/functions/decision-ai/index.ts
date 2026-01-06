import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Decision {
  id: string;
  title: string;
  choice: string;
  alternatives: string[];
  category: string;
  confidence: number;
  tags: string[];
  context: string;
  createdAt: string;
  outcomes: Array<{
    rating: number;
    wouldChooseDifferently: boolean;
    reflection: string;
  }>;
}

interface RequestBody {
  type: 'predict' | 'alternatives' | 'biases' | 'replay' | 'chat';
  currentDecision?: Partial<Decision>;
  decisions: Decision[];
  question?: string;
  settings?: {
    tone: string;
    adviceStyle: string;
    showConfidenceScores: boolean;
  };
}

const getTonePrompt = (tone: string): string => {
  switch (tone) {
    case 'encouraging': return 'Be supportive and optimistic while being realistic.';
    case 'honest': return 'Be direct and truthful, even if uncomfortable.';
    case 'analytical': return 'Focus on data and logical analysis.';
    case 'friendly': return 'Be warm, approachable, and conversational.';
    default: return 'Be balanced and helpful.';
  }
};

const getStylePrompt = (style: string): string => {
  switch (style) {
    case 'direct': return 'Give clear, actionable advice.';
    case 'exploratory': return 'Ask thought-provoking questions to guide thinking.';
    case 'balanced': return 'Mix advice with questions to encourage reflection.';
    default: return 'Provide balanced guidance.';
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { type, currentDecision, decisions, question, settings }: RequestBody = await req.json();

    console.log(`Processing ${type} request with ${decisions.length} decisions`);

    const tonePrompt = getTonePrompt(settings?.tone || 'encouraging');
    const stylePrompt = getStylePrompt(settings?.adviceStyle || 'balanced');
    const showConfidence = settings?.showConfidenceScores !== false;

    let systemPrompt = `You are a personal decision advisor AI that has deep knowledge of the user's past decisions and patterns. ${tonePrompt} ${stylePrompt}
    
You have access to ${decisions.length} of the user's past decisions. Analyze patterns, preferences, and outcomes to provide personalized advice.

${showConfidence ? 'Include confidence percentages in your analysis.' : 'Do not include confidence percentages.'}

Format your responses in markdown with clear sections and bullet points.`;

    let userPrompt = '';

    // Build context from past decisions
    const decisionContext = decisions.slice(0, 20).map(d => {
      const outcomes = d.outcomes?.length 
        ? `Outcomes: ${d.outcomes.map(o => `Rating ${o.rating}/10, ${o.wouldChooseDifferently ? 'would choose differently' : 'satisfied with choice'}`).join('; ')}`
        : 'No outcome recorded yet';
      return `- "${d.title}" (${d.category}, ${d.confidence}% confident): ${d.choice}. ${outcomes}`;
    }).join('\n');

    switch (type) {
      case 'predict':
        userPrompt = `Based on these similar past decisions:
${decisionContext}

Predict the likely outcome for this new decision:
Title: ${currentDecision?.title || 'Untitled'}
Category: ${currentDecision?.category || 'Unknown'}
Choice: ${currentDecision?.choice || 'Not specified'}
Alternatives considered: ${currentDecision?.alternatives?.join(', ') || 'None'}
Context: ${currentDecision?.context || 'None'}
Confidence: ${currentDecision?.confidence || 50}%

Provide:
1. **Predicted Outcome** - Likely success/failure and why
2. **Success Likelihood** - Percentage based on similar past decisions
3. **Key Factors to Consider** - What might influence the outcome
4. **Risk Assessment** - Potential pitfalls to watch for
5. **Recommendation** - Should they proceed or reconsider?`;
        break;

      case 'alternatives':
        userPrompt = `The user is considering this decision:
Title: ${currentDecision?.title || 'Untitled'}
Category: ${currentDecision?.category || 'Unknown'}
Their current choice: ${currentDecision?.choice || 'Not specified'}
Alternatives they've thought of: ${currentDecision?.alternatives?.join(', ') || 'None'}
Context: ${currentDecision?.context || 'None'}

Based on their past decision patterns:
${decisionContext}

Suggest 3-5 alternative approaches they might not have considered. For each alternative:
1. **Alternative Name** - Brief title
2. **Description** - What this would look like
3. **Why Consider This** - Based on their past patterns, why might this work
4. **Potential Drawback** - What to watch out for
5. **Fit Score** - How well this matches their decision style (%)`;
        break;

      case 'biases':
        userPrompt = `Analyze these ${decisions.length} decisions for cognitive biases and patterns:
${decisionContext}

Identify:
1. **Overconfidence Patterns** - Categories or situations where confidence doesn't match outcomes
2. **Recurring Blind Spots** - Types of alternatives consistently overlooked
3. **Decision Timing Patterns** - When do they make better/worse decisions?
4. **Category-Specific Tendencies** - Biases that appear in specific areas (career, finance, etc.)
5. **Success vs Confidence Correlation** - Are they calibrated or miscalibrated?
6. **Actionable Recommendations** - 3 specific ways to improve decision-making

Be constructive but honest about areas for improvement.`;
        break;

      case 'replay':
        userPrompt = `The user wants to explore "what if" scenarios.

Their past decisions:
${decisionContext}

Their question: "${question}"

Based on the patterns in their decision history, simulate and analyze:
1. **The Alternative Path** - What would likely have happened if they chose differently
2. **Probability Assessment** - How likely is this alternate outcome?
3. **Butterfly Effects** - How might subsequent decisions have changed?
4. **Learning Insight** - What can they learn from this thought experiment?
5. **Moving Forward** - How to apply this insight to future decisions`;
        break;

      case 'chat':
        userPrompt = `The user's past decisions for context:
${decisionContext}

The user asks: "${question}"

Provide personalized advice based on their decision patterns and history. Be specific and reference their actual past decisions when relevant.`;
        break;

      default:
        throw new Error('Invalid request type');
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to continue using AI features." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";

    console.log(`Successfully generated ${type} response`);

    return new Response(JSON.stringify({ content, type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Decision AI error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
