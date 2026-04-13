/**
 * AI Service for connecting to KADA AI Cloud Endpoint.
 */
const axios = require('axios');

const KADA_API_URL = process.env.KADA_API_URL; // ✅ Pindah ke .env
const KADA_API_KEY = process.env.KADA_API_KEY;
const KADA_MODEL = process.env.KADA_MODEL || 'openai/gpt-5.2-pro';

// HELPER — Extract text from various KADA API response formats
// KADA returns output[] with mixed types: "reasoning" (no content) + "message" (has content)
// We must find the "message" type item, NOT just blindly read output[0]
const extractResponseText = (data) => {
  // Format 1: OpenAI-compatible (choices array)
  if (data.choices?.[0]?.message?.content) {
    return data.choices[0].message.content;
  }

  // Format 2: KADA Responses API (output array with mixed types)
  // Iterate to find the item with type === "message"
  if (Array.isArray(data.output)) {
    for (const item of data.output) {
      if (item.type === 'message' && item.content?.[0]?.text) {
        return item.content[0].text;
      }
    }
  }

  // Fallback: stringify entire response for debugging
  return JSON.stringify(data);
};

// FUNGSI 1 — Analyze CV & Scoring
exports.analyzeCV = async (cvText, jobRequirements) => {
  try {
    const prompt = `You are a Senior IT Technical Recruiter with 10+ years of experience 
evaluating software engineering candidates. Your evaluations are known for being 
strict, consistent, and objective.

Evaluate the candidate's CV against the job requirements using this internal rubric:
- Technical Skills Match (40%): Does the candidate's tech stack align with requirements?
- Relevant Experience (30%): Years and depth of experience relevant to the role?
- Project & Achievement Quality (20%): Are past projects measurable, complex, and impactful?
- Education & Certifications (10%): Relevant degree or certifications present?

Scoring guidelines (be strict — do not inflate scores out of politeness):
- 85–100 : Excellent fit, hire-ready
- 70–84  : Good fit, minor gaps
- 50–69  : Partial fit, significant gaps
- Below 50: Poor fit, does not meet core requirements

Return ONLY a valid JSON object, no markdown, no extra text:
{
  "score": <number 0-100>,
  "summary": "<2-3 sentences summarizing overall candidate fit>",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"]
}

Job Requirements:
${jobRequirements}

Candidate CV Content:
${cvText}`;

    const chatPayload = {
      model: KADA_MODEL,
      input: [{ role: 'user', content: prompt }]
    };

    const response = await axios.post(KADA_API_URL, chatPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KADA_API_KEY}`
      },
      timeout: 30000, // 30 detik timeout
    });

    const data = response.data;
    console.log('\n[DEBUG KADA API - analyzeCV]:', JSON.stringify(data, null, 2));

    let cleanResponseText = extractResponseText(data); 
    if (typeof cleanResponseText !== 'string') {
      cleanResponseText = JSON.stringify(cleanResponseText);
    }

    cleanResponseText = cleanResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanResponseText);

    return {
      score: result.score ?? 0,               
      summary: result.summary ?? 'No summary provided.',
      strengths: result.strengths ?? [],
      weaknesses: result.weaknesses ?? [],
    };
  } catch (error) {
    if (error.response) {
      console.error('Error KADA API (analyzeCV):', error.response.status, error.response.data);
    } else {
      console.error('Error in aiService.analyzeCV:', error.message);
    }
    throw error;
  }
};

// FUNGSI 2 — Generate Rejection Feedback 

exports.generateRejectionFeedback = async (cvText, jobRequirements) => {
  try {
    const prompt = `You are an empathetic yet professional HR Technical Evaluator.
A candidate has been rejected for a position based on their CV and the job requirements.
Your task is to provide 3 to 4 bullet points of constructive, highly specific, and actionable feedback on what the candidate lacks and needs to improve for future opportunities.
Use polite, encouraging, and professional English. Use Markdown bullet points.
IMPORTANT: You are writing ONLY the feedback section. DO NOT write an email introduction, greetings, or conclusions like "Thank you" or "Best regards". Start directly with the feedback evaluation.

Job Requirements:
${jobRequirements}

Candidate CV Content:
${cvText}`;

    const chatPayload = {
      model: KADA_MODEL,
      input: [{ role: 'user', content: prompt }]
    };

    const response = await axios.post(KADA_API_URL, chatPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KADA_API_KEY}`
      },
      timeout: 30000, // 30 detik timeout
    });

    const data = response.data;
    console.log('\n[DEBUG KADA API - Rejection]:', JSON.stringify(data, null, 2));

    let cleanResponseText = extractResponseText(data); // Pakai helper
    if (typeof cleanResponseText !== 'string') {
      cleanResponseText = JSON.stringify(cleanResponseText);
    }

    return cleanResponseText.trim();
  } catch (error) {
    if (error.response) {
      console.error('Error KADA API (Rejection):', error.response.status, error.response.data);
    } else {
      console.error('Error in aiService.generateRejectionFeedback:', error.message);
    }
    throw error;
  }
};