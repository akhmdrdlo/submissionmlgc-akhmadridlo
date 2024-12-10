const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
const storeData = require('../services/storeData');
const { Firestore } = require('@google-cloud/firestore');
 
async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;
 
  const { confidenceScore, label, suggestion } = await predictClassification(model, image);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
 
  const data = {
    "id": id,
    "result": label,
    "suggestion": suggestion,
    "createdAt": createdAt
  }
  
  await storeData(id, data);

  const response = h.response({
    status: 'success',
    message: confidenceScore > 99 ? 'Model is predicted successfully' : 'Model is predicted successfully',
    data
  })
  response.code(201);
  return response;
}

async function getPredictionHistoriesHandler(request, h) {
    try {
        // Inisialisasi Firestore
        const db = new Firestore({
            projectId: 'submissionmlgc-johnpreslynasut',
            keyFilename: 'credential.json', // Sesuaikan path credential Anda
        });

        // Mengambil koleksi data prediksi
        const predictCollection = db.collection('prediction');
        const snapshot = await predictCollection.get();

        // Periksa apakah ada data
        if (snapshot.empty) {
            return h.response({
                status: 'success',
                data: [],
            }).code(200);
        }

        // Format data untuk response
        const histories = snapshot.docs.map((doc) => {
            const historyData = doc.data();

            // Tambahkan logika untuk mengatur suggestion jika result = "Non-cancer"
            const suggestion =
                historyData.result === 'Non-cancer'
                    ? 'Anda sehat!'
                    : historyData.suggestion;

            // Format ulang setiap dokumen sesuai permintaan
            return {
                id: doc.id,
                history: {
                    result: historyData.result,
                    createdAt: historyData.createdAt,
                    suggestion: suggestion,
                    id: doc.id
                },
            };
        });

        // Response dengan format yang sesuai
        return h.response({
            status: 'success',
            data: histories,
        }).code(200);
    } catch (error) {
        console.error('Error fetching prediction histories:', error);

        // Response jika terjadi error
        return h.response({
            status: 'fail',
            message: 'Terjadi kesalahan saat mengambil data prediksi.',
        }).code(500);
    }
}

 
module.exports = { postPredictHandler, getPredictionHistoriesHandler };
