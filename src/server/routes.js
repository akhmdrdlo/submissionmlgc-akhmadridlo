const { postPredictHandler, getPredictionHistoriesHandler } = require('../server/handler');
 
const routes = [
  {
    path: '/predict',
    method: 'POST',
    handler: postPredictHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        // maxBytes: 1048576,
        // output: 'stream',             // Menggunakan stream untuk file besar
        // parse: true ,
        multipart: true
      }
    }
  },
  {
    method: 'GET',
    path: '/predict/histories',
    handler: getPredictionHistoriesHandler,
  },
]
 
module.exports = routes;
