// src/services/aiService.js
const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

*//
* Sent CV text to AI for signing
*/
async function analyzeCvText(cvText) {
    constresponse = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
        {
            role: "system",
            content:
        You are an HR AI screener.
        Evaluate candidate CV and return:
        - Score (0-100)
        - Strenghts (bullet points)
        -Weakness (bullet points)
                ,
            },
        ],
    });
    return response.choices[0].message.content;
}

/** 
 * Generator feedback rejected like professional HR
 */
async function generateRejectionFeedback(data) {
    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
        {
            role: "system",
            content:
You are an HR officer writing a polite rejection email.
Tone must be roffesional and human.
            ,
            },
        ]
    })
} 