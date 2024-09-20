// kafkaConfig.js
const { Kafka } = require('kafkajs');

let kafka = null;
let producer = null;
let consumer = null;

const connectKafka = async () => {
  try {
    kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID,
      brokers: [process.env.KAFKA_BROKER_URL] // Ex: 'localhost:9092'
    });

    // Criar o produtor
    producer = kafka.producer();
    await producer.connect();
    console.log('Kafka producer conectado');

    // Criar o consumidor
    consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_ID });
    await consumer.connect();
    console.log('Kafka consumer conectado');
  } catch (error) {
    console.error('Falha ao conectar ao Kafka', error);
  }
};

// Função para pegar o produtor
const getProducer = () => {
  if (!producer) {
    throw new Error('Producer não conectado');
  }
  return producer;
};

// Função para pegar o consumidor
const getConsumer = () => {
  if (!consumer) {
    throw new Error('Consumer não conectado');
  }
  return consumer;
};

module.exports = {
  connectKafka,
  getProducer,
  getConsumer
};
