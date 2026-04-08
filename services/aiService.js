/**
 * AI Service for connecting to KADA AI Cloud Endpoint.
 */
const axios = require('axios');

// Replace this ENDPOINT URL with the URL from your dashboard
const KADA_API_URL = "https://mlapi.run/8ad406df-bb6c-4a51-aaaf-3aa3235598d8/v1/responses";

/**
 * Analyzes an applicant's CV text against job requirements.
 */
exports.analyzeCV = async (cvText, jobRequirements) => {
  try {
    const prompt = `You are a highly experienced Senior IT Technical Recruiter.
Your task is to analyze a candidate's CV based on the provided job requirements.
Provide an objective evaluation and return ONLY a valid JSON format below (no markdown blocks, no extra text):
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
      model: "openai/gpt-5.2-pro", 
      input: [{ role: "user", content: prompt }]
    };

    const response = await axios.post(KADA_API_URL, chatPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KADA_API_KEY}`
      }
    });

    const data = response.data;
    console.log("\n[DEBUG KADA API - analyzeCV]:", JSON.stringify(data, null, 2));
    
    let cleanResponseText = "";
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      cleanResponseText = data.choices[0].message.content;
    } else if (data.output && data.output.length > 0 && data.output[0].content && data.output[0].content.length > 0) {
      cleanResponseText = data.output[0].content[0].text;
    } else if (data.text) { 
      cleanResponseText = data.text;
    } else {
      cleanResponseText = data;
    }

    if (typeof cleanResponseText !== "string") {
      cleanResponseText = JSON.stringify(cleanResponseText);
    }

    cleanResponseText = cleanResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleanResponseText);
    
    return {
      score: result.score,
      summary: result.summary,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
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

/**
 * Generates a polite, human-toned rejection feedback for Email.
 */
exports.generateRejectionFeedback = async (cvText, jobRequirements) => {
  try {
    const prompt = `You are an empathetic yet professional HR Manager.
Your task is to write a personalized, constructive, and humane rejection email
to a candidate who did not pass the selection process.
Use polite and professional English.
Explain specifically what the candidate needs to improve for future opportunities based on their CV and the job requirements.
Do not sound like a robot — write with warmth and sincerity.
Return ONLY the rejection email content without any subject line or opening greetings.

Job Requirements:
${jobRequirements}

Candidate CV Content:
${cvText}`;

    const chatPayload = {
      model: "openai/gpt-5.2-pro",
      input: [{ role: "user", content: prompt }]
    };

    const response = await axios.post(KADA_API_URL, chatPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KADA_API_KEY}`
      }
    });

    const data = response.data;
    console.log("\n[DEBUG KADA API - Rejection]:", JSON.stringify(data, null, 2));

    let cleanResponseText = "";
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      cleanResponseText = data.choices[0].message.content;
    } else if (data.output && data.output.length > 0 && data.output[0].content && data.output[0].content.length > 0) {
      cleanResponseText = data.output[0].content[0].text;
    } else if (data.text) { 
      cleanResponseText = data.text;
    } else {
      cleanResponseText = data;
    }
    
    if (typeof cleanResponseText !== "string") {
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