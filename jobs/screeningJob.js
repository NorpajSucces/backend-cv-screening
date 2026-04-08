/**
 * Asynchronous job to extract text from a CV (PDF) and run AI Screening.
 */
const axios = require('axios');
const pdfParse = require('pdf-parse');
const aiService = require('../services/aiService');
const JobPosting = require('../models/JobPosting');
const Candidate = require('../models/Candidate');

// We accept the candidate document object passed from the controller
module.exports = async function screeningJob(candidateRecord) {
  const candidateId = candidateRecord._id;
  console.log(`\n[BACKGROUND JOB START] Screening Candidate: ${candidateRecord.email} (ID: ${candidateId})`);
  
  try {
    // 1. Re-fetch the Candidate record to ensure we have the latest Mongoose instance
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      console.error(`[ERROR] Candidate ${candidateId} not found.`);
      return;
    }

    // 2. Fetch the corresponding Job Posting
    const job = await JobPosting.findById(candidate.jobId);
    if (!job) {
      console.error(`[ERROR] Job for Candidate ${candidateId} not found.`);
      candidate.status = 'failed';
      await candidate.save();
      return;
    }

    console.log(`- Downloading PDF from: ${candidate.cvUrl}`);
    // 3. Download the PDF from Cloudinary URL into an ArrayBuffer
    const response = await axios.get(candidate.cvUrl, { responseType: 'arraybuffer' });
    const pdfBuffer = Buffer.from(response.data, 'binary');

    console.log(`- Extracting text from PDF (pdf-parse)...`);
    // 4. Extract text from the PDF Buffer
    const pdfData = await pdfParse(pdfBuffer);
    const cvText = pdfData.text;

    if (!cvText || cvText.trim() === '') {
      console.warn(`[WARNING] No readable text found in Candidate ${candidateId}'s CV.`);
    }

    console.log(`- Sending text to KADA HTTP AI endpoint for analysis...`);
    // 5. Send to AI (Using Refactored aiService in English)
    const aiResult = await aiService.analyzeCV(cvText, job.requirements);

    // 6. Format Result and Save to DB
    console.log(`- AI Screening Success! Extracted Score: ${aiResult.score}`);
    
    candidate.aiScore = aiResult.score || 0;
    candidate.aiSummary = aiResult.summary || "No summary provided.";
    
    // Convert JSON Arrays to Comma-Separated Strings for our Schema
    candidate.aiStrengths = Array.isArray(aiResult.strengths) 
      ? aiResult.strengths.join(', ') 
      : (aiResult.strengths || "None");
      
    candidate.aiWeaknesses = Array.isArray(aiResult.weaknesses) 
      ? aiResult.weaknesses.join(', ') 
      : (aiResult.weaknesses || "None");
      
    // IMPORTANT: Mark the workflow cycle finished!
    candidate.status = 'processed'; 

    await candidate.save();
    console.log(`[BACKGROUND JOB SUCCESS] Candidate ${candidate.email} updated to 'processed'.\n`);
  } catch (error) {
    console.error(`[BACKGROUND JOB FAILED] Screening for ${candidateId} failed:`, error.message);
    
    try {
      // Mark candidate as failed so HR knows something went wrong
      await Candidate.findByIdAndUpdate(candidateId, { status: 'failed' });
      console.log(`- Candidate ${candidateId} status safely set to 'failed' on DB fallback.\n`);
    } catch (saveError) {
      console.error("- Could not update candidate DB status to 'failed':", saveError.message);
    }
  }
};