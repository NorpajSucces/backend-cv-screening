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
    const prompt = `You are a highly experienced Senior IT Technical Recruiter 
specializing in software engineering roles. Evaluate the candidate's technical 
skills, relevant project experience, and technology stack alignment strictly 
based on the job requirements provided.

Your task is to analyze a candidate's CV based on the provided job requirements.
Provide an objective evaluation and return ONLY a valid JSON format below 
(no markdown blocks, no extra text):
{
  "score": <number 0-100>,
  "summary": "<short 2-3 sentence summary about the candidate overall>",
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
    const prompt = `You are an empathetic yet professional HR Manager.
Your task is to write a personalized, constructive, and humane rejection email
to a candidate who did not pass the selection process.
Use polite and professional English.
Explain specifically what the candidate needs to improve for future opportunities 
based on their CV and the job requirements.
Do not sound like a robot — write with warmth and sincerity.
Return ONLY the rejection email content without any subject line or opening greetings.

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