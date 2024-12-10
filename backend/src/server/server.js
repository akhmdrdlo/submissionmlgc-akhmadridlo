require('dotenv').config();
 
const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/InputError');
const MAX_IMAGE_SIZE = 1000000; 

(async () => {
    const server = Hapi.server({
        port: 8080,
        host: '0.0.0.0',
        routes: {
            cors: {
              origin: ['*'],
            },
            payload: {
                maxBytes: MAX_IMAGE_SIZE, // Menambahkan batas maksimum ukuran payload di server
                parse: true
            }
        },
    });
 
    const model = await loadModel();
    server.app.model = model;

    // Menambahkan pengecekan ukuran gambar sebelum diterima
    // server.ext('onRequest', (request, h) => {
    //     // Pastikan payload memiliki file dan file tersebut adalah gambar
    //     if (request.payload && request.payload.image) {
    //         const imageSize = request.payload.image.byteLength; // Mengambil ukuran gambar dalam byte

    //         // Memeriksa jika ukuran gambar melebihi 1MB
    //         if (imageSize > MAX_IMAGE_SIZE) {
    //             return h.response({
    //                 status: 'fail',
    //                 message: 'Gambar terlalu besar, maksimal 1MB.'
    //             }).code(413); // Status code 413 untuk payload terlalu besar
    //         }
    //     }

    //     return h.continue;
    // });
 
    server.route(routes);
 
    server.ext('onPreResponse', function (request, h) {
        const response = request.response;

        // if (request.payload && request.payload.image) {
        //     const imageSize = request.payload.image.byteLength; // Mengambil ukuran gambar dalam byte

        //     // Memeriksa jika ukuran gambar melebihi 1MB
        //     if (imageSize > MAX_IMAGE_SIZE) {
        //         return h.response({
        //             status: 'fail',
        //             message: 'Gambar terlalu besar, maksimal 1MB.'
        //         }).code(413); // Status code 413 untuk payload terlalu besar
        //     }
        //     return h.continue;
        // }

        if (response.isBoom && response.output.statusCode === 413) {
            const newResponse = h.response({
                status: 'fail',
                message: 'Payload content length greater than maximum allowed: 1000000',
            });
            newResponse.code(413);
            return newResponse;
        }

       
 
        if (response instanceof InputError) {
            const newResponse = h.response({
                status: 'fail',
                message: `${response.message}`
            })
            newResponse.code(response.statusCode)
            return newResponse;
        }
 
        if (response.isBoom) {
            const newResponse = h.response({
                status: 'fail',
                message: response.message
            })
            newResponse.code(response.statusCode)
            return newResponse;
        }
 
        return h.continue;
    });
 
    await server.start();
    console.log(`Server start at: ${server.info.uri}`);
})();
