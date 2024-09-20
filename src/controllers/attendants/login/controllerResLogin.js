const { getConsumer } = require('../../../config/kafka');
const activeRequests = new Map(); // Para armazenar referências de requisições ativas e seus timeouts

const TIMEOUT_DURATION = 15000; // Definindo um tempo limite de 15 segundos

// Função para iniciar o consumidor de respostas
const startResponseConsumer = async () => {
  try {
    const consumer = getConsumer();
    await consumer.subscribe({ topic: 'controller_responses', fromBeginning: true });
    console.log('Consumidor inscrito no tópico controller_responses.');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const responseContent = JSON.parse(message.value.toString());
        const correlationId = message.headers.correlationId.toString();

        console.log(`Recebendo resposta para correlationId: ${correlationId}`);

        // Verificar se há uma requisição ativa correspondente
        const requestData = activeRequests.get(correlationId);

        if (requestData) {
          const { res, timeoutId } = requestData;
          // Cancela o timeout se a resposta chegou a tempo
          clearTimeout(timeoutId);

          // Envia a resposta para o cliente
          res.status(responseContent.status).json({ message: responseContent.message });
          // Remover a requisição da lista ativa após enviar a resposta
          activeRequests.delete(correlationId);
        } else {
          console.log(`Nenhuma requisição ativa encontrada para o correlationId: ${correlationId}`);
        }
      }
    });

    console.log('Consumidor de respostas iniciado.');
  } catch (error) {
    console.error('Erro ao iniciar o consumidor de respostas:', error.message);
  }
};

// Função para registrar a resposta ativa com timeout
const registerActiveRequest = (correlationId, res) => {
  // Definir o timeout que retornará erro se a resposta não chegar no tempo estipulado
  const timeoutId = setTimeout(() => {
    const requestData = activeRequests.get(correlationId);
    if (requestData) {
      console.log(`Timeout atingido para correlationId: ${correlationId}`);
      requestData.res.status(504).json({ message: 'Tempo limite excedido. Sem resposta do servidor.' });
      activeRequests.delete(correlationId); // Remove a requisição ativa após o timeout
    }
  }, TIMEOUT_DURATION);

  // Armazenar a requisição ativa com seu timeoutId
  activeRequests.set(correlationId, { res, timeoutId });
};

module.exports = {
  startResponseConsumer,
  registerActiveRequest
};
