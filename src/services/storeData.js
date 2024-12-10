const { Firestore } = require('@google-cloud/firestore');

async function storeData(id, data) {
  try {
    const db = new Firestore({
      projectId: 'submissionmlgc-johnpreslynasut',
      keyFilename: 'credential.json',
    });

    const predictCollection = db.collection('predictions');
    await predictCollection.doc(id).set(data);

    console.log(`Data successfully stored: ${id}`);
  } catch (error) {
    console.error('Error storing data to Firestore:', error.message);
    throw error;
  }
}

module.exports = storeData;

