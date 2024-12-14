FROM node:18

WORKDIR /app
ENV PORT=8080
ENV HOST=0.0.0.0

COPY . .
RUN npm install


ENV MODEL_URL=https://storage.googleapis.com/model-submissionmlgc-raihan/model-in-prod/model.json
EXPOSE 8080
CMD [ "npm", "run", "start"]