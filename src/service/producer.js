// producer.js
const { getProducer } = require('../config/kafka');

const sendMessage = async (message, topic = 'db_requisitions', headers = {}) => {
  const producer = getProducer();
  try {
    await producer.send({
      topic: topic, // Enviar para o tópico especificado
      messages: [{ value: JSON.stringify(message), headers }] // Mensagem com headers opcionais
    });
    console.log('Mensagem enviada para o tópico Kafka:', message);
  } catch (error) {
    console.error('Erro ao enviar mensagem para o Kafka:', error);
    throw new Error('Erro ao enviar mensagem para o Kafka');
  }
};

module.exports = sendMessage;
