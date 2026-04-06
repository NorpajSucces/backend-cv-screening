/**
 * Layanan AI untuk terhubung ke KADA AI Cloud Endpoint.
 */
const axios = require('axios');

// Ganti ENDPOINT URL INI dengan URL dari dashboard Anda (misalnya https://mlapi.run/... )
// Pastikan tidak ada `/v1/responses` di belakangnya kecuali memang diwajibkan oleh platform Anda.
const KADA_API_URL = "https://mlapi.run/8ad406df-bb6c-4a51-aaaf-3aa3235598d8/v1/responses";

/**
 * Menganalisis teks CV pelamar terhadap kualifikasi pekerjaan.
 */
exports.analyzeCV = async (cvText, jobRequirements) => {
  try {
    const prompt = `Anda adalah seorang Technical Recruiter senior. Tugas Anda adalah menilai CV pelamar berdasarkan kriteria loker di bawah ini.

Syarat & Posisi Pekerjaan:
${jobRequirements}

Teks Mentah CV Pelamar:
${cvText}

Tolong berikan penilaian objektif tentang kecocokan pelamar.
HARUS membalas HANYA dengan JSON valid (tanpa string tambahan, tanpa markdown block) seperti berikut:
{
  "score": <angka_0-100>,
  "strengths": "<kelebihan_pelamar_sesuai_loker>",
  "weaknesses": "<kelemahan_pelamar_sesuai_loker>"
}
`;

    const chatPayload = {
      model: "openai/gpt-5.2-pro", // Ditambahkan sesuai petunjuk KADA API terbaru
      input: [{ role: "user", content: prompt }]
    };

    const response = await axios.post(KADA_API_URL, chatPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KADA_API_KEY}`
      }
    });

    const data = response.data;
    console.log("\\n[DEBUG KADA API - analyzeCV]:", JSON.stringify(data, null, 2));
    
    let cleanResponseText = "";
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      cleanResponseText = data.choices[0].message.content;
    } else if (data.text) { 
      cleanResponseText = data.text;
    } else {
      cleanResponseText = data;
    }

    if (typeof cleanResponseText !== "string") {
      cleanResponseText = JSON.stringify(cleanResponseText);
    }

    cleanResponseText = cleanResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanResponseText);
  } catch (error) {
    if (error.response) {
      console.error('Error KADA API (analyzeCV):', error.response.status, error.response.data);
    } else {
      console.error('Error pada aiService.analyzeCV:', error.message);
    }
    throw error;
  }
};

/**
 * Menghasilkan kalimat halus bernada manusia perihal alasan penolakan untuk dikirim di Email.
 */
exports.generateRejectionFeedback = async (cvText, jobRequirements) => {
  try {
    const prompt = `Anda adalah seorang HR Manager yang empatik namun profesional. 
Buatkan 1-2 paragraf umpan balik (feedback) konstruktif menolak pelamar ini dari lokernya.
Sebutkan poin spesifik dari CV-nya yang perlu ditingkatkan agar memenuhi loker ini.
Sopan, tanpa basa-basi berlebih. Tulis dalam Bahasa Indonesia.

Syarat & Posisi Pekerjaan:
${jobRequirements}

Teks Mentah CV Pelamar:
${cvText}`;

    const chatPayload = {
      model: "openai/gpt-5.2-pro", // Ditambahkan sesuai petunjuk KADA API terbaru
      input: [{ role: "user", content: prompt }]
    };

    const response = await axios.post(KADA_API_URL, chatPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KADA_API_KEY}`
      }
    });

    const data = response.data;
    console.log("\\n[DEBUG KADA API - Rejection]:", JSON.stringify(data, null, 2));

    let cleanResponseText = "";
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      cleanResponseText = data.choices[0].message.content;
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
      console.error('Error pada aiService.generateRejectionFeedback:', error.message);
    }
    throw error;
  }
};
