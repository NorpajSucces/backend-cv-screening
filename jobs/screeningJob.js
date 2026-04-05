// src/jobs/screeningJobs.js

/**
 * Mock screening AI job
 * This file will be replaced by backEnd AI 
 */ 

module.exports = async function screeningJob(candidate) {
    console.log("=== Screening Job Started ===");
    console.log("Candidate:", candidate.email);

    //Old process simulation (AI CV reader)
setTimeout(() => {
    console.log("=== Screening Finished (mock) ===");
}, 3000);
};