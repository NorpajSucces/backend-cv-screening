require('dotenv').config();
const axios = require('axios');
const aiService = require('./services/aiService');

const testKadaAI = async () => {
  try {
    console.log(' Sedang menghubungi KADA Elice Cloud untuk Test Analisis CV...');

    // 1. Bayangkan ini adalah parameter Job Requirement yg ada di Database Loker
    const dummyJobRequirements = `
    Posisi: UI/UX Designer
    Persyaratan: 
    - Pengalaman visual design minimal 1 tahun.
    - Wajib menguasai Figma dan membuat perancangan Prototype Interaktif.
    - Memahami konsep dasar HTML dan CSS.
    `;

    // 2. Bayangkan ini adalah hasil ekstraksi mentah dari PDF CV milik Pelamar
    const dummyCvText = `
    Nama: Siska Yulianti
    Deskripsi: Fresh graduate dari jurusan Desain Komunikasi Visual.
    Pengalaman Organisasi: Pernah menjadi anggota divisi publikasi kepanitiaan festival mendesain menggunakan Canva.
    Keahlian Tambahan: Mengoperasikan Adobe Photoshop dan Ilustrator, tapi belum pernah menggunakan Figma.
    Pernah belajar sedikit HTML via youtube.
    `;

    console.log('=======================================================\n');
    console.log('MENGUJI FUNGSI 1: analyzeCV (Screening CV JSON Mode)');
    
    // Kita panggil fungsi service yang sudah disesuaikan dengan contoh Anda
    const screeningResult = await aiService.analyzeCV(dummyCvText, dummyJobRequirements);
    console.log(' HASIL BALASAN (Bisa parsing JSON array/objek):');
    console.log(JSON.stringify(screeningResult, null, 2));


    console.log('\n=======================================================\n');
    console.log(' MENGUJI FUNGSI 2: generateRejectionFeedback (Email HR)');

    const feedbackResult = await aiService.generateRejectionFeedback(dummyCvText, dummyJobRequirements);
    console.log(' HASIL BALASAN PENOLAKAN (Untuk body Email):');
    console.log(feedbackResult);
    console.log('\n=======================================================\n');

  } catch (error) {
    console.error(' Terjadi kesalahan saat menghubungi API:');
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(error.message);
    }
  }
};

testKadaAI();
