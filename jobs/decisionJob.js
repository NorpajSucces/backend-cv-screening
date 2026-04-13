/**
 * Asynchronous job to handle Candidate decisions (Accept/Reject).
 * This manages AI feedback generation and Email delivery in the background.
 */
const axios = require('axios');
const pdfParse = require('pdf-parse');
const aiService = require('../services/aiService');
const { sendEmail } = require('../services/emailService');
const { marked } = require('marked');
const Candidate = require('../models/Candidate');
const JobPosting = require('../models/JobPosting');

module.exports = async function decisionJob(candidateRecord, type) {
    const candidateId = candidateRecord._id;
    console.log(`\n[DECISION JOB START] Type: ${type} | Candidate ID: ${candidateId}`);

    try {
        // 1. Re-fetch the Candidate record
        const candidate = await Candidate.findById(candidateId);
        if (!candidate) {
            console.error(`- Candidate ${candidateId} not found in background job.`);
            return;
        }

        // 2. Fetch the corresponding Job Posting for requirements & title
        const job = await JobPosting.findById(candidate.jobId);
        if (!job) {
            console.error(`- Job for Candidate ${candidateId} not found.`);
        }
        if (type === 'reject') {
            // 1. Generate AI Feedback if not exists
            if (!candidate.aiFeedback) {
                console.log(`- Requesting AI Rejection Feedback for ${candidate.email}...`);
                const response = await axios.get(candidate.cvUrl, { responseType: 'arraybuffer' });
                const pdfBuffer = Buffer.from(response.data, 'binary');
                const pdfData = await pdfParse(pdfBuffer);
                const cvText = pdfData.text;

                // Safely get requirements
                const jobRequirements = (job && job.requirements) 
                    ? job.requirements 
                    : "General requirements";

                candidate.aiFeedback = await aiService.generateRejectionFeedback(cvText, jobRequirements);
                await candidate.save();
                console.log(`- AI Feedback saved for ${candidate.email}`);
            }

            // 2. Prepare and Send Rejection Email
            const htmlFeedback = marked.parse(candidate.aiFeedback || '*No specific feedback available.*');
            
            await sendEmail({
                to: candidate.email,
                subject: 'Application Update: SmartRecruiter',
                html: `
                    <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #1e293b;">Thank You for Your Application</h2>
                        <p>Dear <strong>${candidate.name}</strong>,</p>
                        <p>We sincerely appreciate the time and effort you put into your application for the <strong>${job?.title || 'position'}</strong> role. It was a pleasure reviewing your profile.</p>
                        <p>After careful consideration, we regret to inform you that you will not be moving forward to the next stage of our recruitment process at this time.</p>
                        <p>As part of our commitment to helping candidates grow, we've included personalized feedback from our evaluation system below:</p>
                        
                        <div style="background-color: #f8fafc; padding: 15px 20px; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 20px 0;">
                            ${htmlFeedback}
                        </div>
                        
                        <p>We encourage you to continue developing your skills and exploring new opportunities. We truly appreciate your interest in joining our team and wish you all the best in your future endeavors.</p>
                        <br/>
                        <p>Best regards,</p>
                        <p><strong>SmartRecruiter Team</strong></p>
                    </div>
                `
            });
            console.log(`- Rejection Email sent to ${candidate.email}`);

        } else if (type === 'accept') {
            // Prepare and Send Acceptance Email
            await sendEmail({
                to: candidate.email,
                subject: 'Great News: SmartRecruiter Application Update',
                html: `
                    <div style="font-family: sans-serif; color: #334155; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #059669;">Congratulations ${candidate.name}!</h2>
                        <p>We are pleased to inform you that your application for the <strong>${job?.title || 'position'}</strong> role has successfully passed our initial screening process.</p>
                        <p>Our team was impressed with your background and qualifications. You will be proceeding to the next phase of our recruitment process.</p>
                        <p><strong>Next Steps:</strong></p>
                        <p>The schedule and specific details for the upcoming stage (interview/test) will be communicated to you in a follow-up email shortly. Kindly keep an eye on your inbox.</p>
                        <p>We look forward to speaking with you soon!</p>
                        <br/>
                        <p>Best regards,</p>
                        <p><strong>SmartRecruiter Team</strong></p>
                    </div>
                `
            });
            console.log(`- Acceptance Email sent to ${candidate.email}`);
        }

        console.log(`[DECISION JOB SUCCESS] Finished background tasks for ${candidate.email}\n`);

    } catch (error) {
        console.error(`[DECISION JOB FAILED] Error processing ${candidate.email}:`, error.message);
        // We log it but the candidate status in DB remains updated to 'rejected' or 'advanced' in the controller.
        // In a real production system, we might want to flag the record with a 'notification_failed' property.
    }
};
