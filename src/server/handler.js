import { classifyImage } from '../services/predictionService.js';
import { savePrediction, getPredictionHistory } from '../services/dataService.js';
import crypto from 'crypto';

async function handlePrediction(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  // Convert stream to buffer
  const imageBuffer = await new Promise((resolve, reject) => {
    const chunks = [];
    image.on('data', (chunk) => chunks.push(chunk));
    image.on('end', () => resolve(Buffer.concat(chunks)));
    image.on('error', (err) => reject(err));
  });

  const { result, suggestion } = await classifyImage(model, imageBuffer);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const data = { id, result, suggestion, createdAt };

  await savePrediction(id, data);
  return h.response({
    status: 'success',
    message: 'Model is predicted successfully',
    data,
  }).code(201);
}

async function getPredictionHistoryHandler(request, h) {
  const history = await getPredictionHistory();
  return h.response({
    status: 'success',
    data: history,
  }).code(200);
}

export default { handlePrediction, getPredictionHistory: getPredictionHistoryHandler };
