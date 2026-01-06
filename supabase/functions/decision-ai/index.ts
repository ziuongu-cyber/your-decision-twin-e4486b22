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

interface GuidedAnswer {
  question: string;
  answer: string;
}

interface RequestBody {
  type: 'predict' | 'alternatives' | 'biases' | 'replay' | 'chat' | 'guided-questions' | 'guided-options' | 'guided-recommendation';
  currentDecision?: Partial<Decision>;
  decisions: Decision[];
  question?: string;
  guidedAnswers?: GuidedAnswer[];
  optionRatings?: Array<{ option: string; rating: number }>;
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

    const { type, currentDecision, decisions, question, guidedAnswers, optionRatings, settings }: RequestBody = await req.json();

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

      case 'guided-questions':
        systemPrompt = `You are a thoughtful decision-making coach helping someone think through an important decision. ${tonePrompt}

Your task is to generate 4-5 clarifying questions that will help the person think deeply about their decision. These questions should be:
- Specific to the decision context
- Thought-provoking but not overwhelming
- Progressive (start easier, get deeper)
- Personalized based on their past decision patterns if available

IMPORTANT: Respond ONLY with a valid JSON array of question objects. No markdown, no explanation, just the JSON.`;

        userPrompt = `The user is facing this decision: "${question}"

${decisions.length > 0 ? `Their past decision patterns for context:
${decisionContext}` : 'This is a new user with no decision history yet.'}

Generate 4-5 thoughtful clarifying questions to help them think through this decision.

Respond with a JSON array in this exact format:
[
  {"id": "1", "question": "Question text here", "placeholder": "Placeholder hint for the answer"},
  {"id": "2", "question": "Question text here", "placeholder": "Placeholder hint for the answer"}
]

Categories of questions to consider:
- Values: "What's most important to you about this?"
- Timeline: "When do you need to decide by?"
- Constraints: "What are your limitations or non-negotiables?"
- Stakeholders: "Who else is affected by this decision?"
- Risk tolerance: "What's the worst case you could accept?"

Return ONLY the JSON array, no other text.`;
        break;

      case 'guided-options':
        systemPrompt = `You are a creative decision advisor helping generate options for someone's decision. ${tonePrompt}

Based on their decision context and answers to clarifying questions, generate 3-5 concrete options they could choose from.

IMPORTANT: Respond ONLY with a valid JSON array of option objects. No markdown, no explanation, just the JSON.`;

        const answersContext = guidedAnswers?.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n') || '';

        userPrompt = `The user is deciding: "${question}"

Their answers to clarifying questions:
${answersContext}

${decisions.length > 0 ? `Their past decision patterns:
${decisionContext}` : ''}

Generate 3-5 concrete options they could choose. Each option should be:
- Actionable and specific
- Different from each other (varied approaches)
- Aligned with their stated values and constraints

Respond with a JSON array in this exact format:
[
  {"id": "1", "title": "Option title", "description": "Detailed description of this option and what it would involve", "pros": ["Pro 1", "Pro 2"], "cons": ["Con 1", "Con 2"]},
  {"id": "2", "title": "Option title", "description": "Description", "pros": ["Pro 1"], "cons": ["Con 1"]}
]

Return ONLY the JSON array, no other text.`;
        break;

      case 'guided-recommendation':
        systemPrompt = `You are a trusted decision advisor providing a final recommendation. ${tonePrompt} ${stylePrompt}

Based on everything the user has shared, provide a clear recommendation with thoughtful reasoning.`;

        const allAnswers = guidedAnswers?.map(a => `Q: ${a.question}\nA: ${a.answer}`).join('\n\n') || '';
        const ratingsContext = optionRatings?.map(r => `"${r.option}": ${r.rating}/10`).join('\n') || '';

        userPrompt = `The user is deciding: "${question}"

Their answers to clarifying questions:
${allAnswers}

Their ratings of each option (1-10):
${ratingsContext}

${decisions.length > 0 ? `Their past decision patterns for additional context:
${decisionContext}` : ''}

Provide a comprehensive recommendation that includes:

1. **My Recommendation** - State which option you recommend and why (consider their ratings but also provide independent analysis)

2. **Key Reasoning** - 3-4 bullet points explaining why this fits their values and constraints

3. **What to Watch For** - Potential challenges and how to address them

4. **Next Steps** - 2-3 concrete actions to take if they choose this option

5. **Confidence Level** - Your confidence in this recommendation (high/medium/low) and why

Be direct but supportive. Reference specific things they shared in their answers.`;
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
