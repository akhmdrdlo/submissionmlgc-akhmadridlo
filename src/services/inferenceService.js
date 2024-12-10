const tf = require('@tensorflow/tfjs-node');
const InputError = require('../exceptions/InputError');

async function predictClassification(model, image) {
    try {
        // Mengubah gambar menjadi tensor dan mempersiapkannya untuk model
        const tensor = tf.node
            .decodeJpeg(image) // Dekode gambar JPEG menjadi tensor
            .resizeNearestNeighbor([224, 224]) // Menyesuaikan ukuran gambar dengan yang diharapkan oleh model
            .expandDims() // Menambahkan dimensi batch
            .toFloat(); // Mengkonversi tipe data menjadi float32

        // Kelas hasil klasifikasi
        const classes = ['Cancer', 'Non-cancer'];

        // Melakukan prediksi
        const prediction = model.predict(tensor);
        const score = await prediction.data(); // Mengambil nilai skor hasil prediksi
        const confidenceScore = Math.max(...score) * 100; // Menghitung confidence score (persentase)

        // Menentukan label berdasarkan prediksi
        const classResult = score[0] > 0.5 ? 0 : 1; // Jika prediksi lebih besar dari 0.5, berarti Cancer, jika tidak Non-cancer
        const label = classes[classResult];

        let explanation, suggestion;

        // Penjelasan dan saran berdasarkan label hasil prediksi
        if (label === 'Cancer') {
            explanation = "Cancer adalah jenis penyakit yang menyebabkan pertumbuhan sel abnormal dalam tubuh.";
            suggestion = "Segera periksa ke dokter!";
        } else {
            explanation = "Non-cancer menunjukkan tidak adanya tanda-tanda kanker pada gambar yang dianalisis.";
            suggestion = "Penyakit kanker tidak terdeteksi.";
        }

        // Mengembalikan hasil prediksi
        return { confidenceScore, label, suggestion };
    } catch (error) {
        // Menangani kesalahan yang mungkin terjadi selama pemrosesan
        throw new InputError("Terjadi kesalahan dalam melakukan prediksi");
        // return {
        //     status: "fail",
        //     message: "Terjadi kesalahan dalam melakukan prediksi"
        // };
    }
}

module.exports = predictClassification;

