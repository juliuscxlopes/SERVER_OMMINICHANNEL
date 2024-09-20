//startResponseConsumer.js
const { startResponseConsumer, registerActiveRequest } = require('../../../controllers/attendants/login/controllerResLogin');

// Função para iniciar os consumidores de resposta
const startConsumers = () => {
  try {
    startResponseConsumer(); // Iniciar o consumidor de respostas
    console.log('Consumidores de resposta iniciados com sucesso.');
  } catch (error) {
    console.error('Erro ao iniciar os consumidores de resposta:', error.message);
  }
};

// Função para registrar a requisição ativa com base no correlationId
// Isso permite que a resposta Kafka seja associada à requisição HTTP original
const registerResponse = (correlationId, res) => {
  try {
    registerActiveRequest(correlationId, res);
    console.log(`Requisição registrada para o correlationId: ${correlationId}`);
  } catch (error) {
    console.error('Erro ao registrar a resposta da requisição:', error.message);
  }
};

module.exports = {
  startConsumers,
  registerResponse
};
