//loginConsumers.js
require('dotenv').config();
const axios = require('axios');
const { getConsumer, getProducer } = require('../../../config/kafka');

// Função para enviar resposta de volta ao controlador
const sendResponseToController = async (correlationId, result) => {
  const producer = getProducer();
  
  try {
    // Enviar a resposta para o tópico 'controller_responses'
    await producer.send({
      topic: 'controller_responses',  
      messages: [{
        value: JSON.stringify({ correlationId, result })
      }]
    });
    console.log(`Resposta enviada com sucesso para o controlador com correlationId: ${correlationId}`);
  } catch (error) {
    console.error('Erro ao enviar resposta para o controlador:', error.message);
  }
};

const startLoginConsumers = async () => {
  try {
    const consumer = getConsumer();

    // Configurar o consumidor para ler do tópico 'db_message'
    await consumer.subscribe({ topic: 'db_message', fromBeginning: true });
    console.log('Consumidor inscrito no tópico db_message.');

    // Processar as mensagens recebidas do tópico
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log('Mensagem recebida no Consumer.');

        try {
          const messageContent = JSON.parse(message.value.toString());
          const correlationId = message.headers?.correlationId?.toString();

          if (!correlationId) {
            throw new Error('CorrelationId não encontrado na mensagem.');
          }

          console.log(`Processando mensagem com correlationId: ${correlationId}`);
          console.log(`Dados recebidos:`, messageContent);

          if (messageContent.action === 'login') {
            const { email, password } = messageContent.data;
            console.log(`Processando login de: ${email}`);

            try {
              // Enviar dados para a API de login
              console.log(`Enviando dados para a API de login:`, { email, password });
              const response = await axios.post(process.env.DB_OMMINICHANNEL_LOGIN, { email, password });

              const result = {
                status: response.status === 200 && response.data.success ? 200 : 401,
                message: response.status === 200 && response.data.success ? 'Login bem-sucedido' : 'Credenciais inválidas'
              };

              // Enviar resultado de volta para o controlador
              await sendResponseToController(correlationId, result);

            } catch (error) {
              console.error('Erro ao enviar solicitação para a API de login:', error.message);

              const result = {  
                status: error.response?.status || 500,
                message: error.response?.data?.message || 'Erro ao processar login.'
              };

              // Enviar erro de volta para o controlador
              await sendResponseToController(correlationId, result);
            }
          }

        } catch (error) {
          console.error('Erro ao processar a mensagem no consumer:', error.message);
        }
      }
    });

    console.log('Consumers de login iniciado.');

  } catch (error) {
    console.error('Erro ao iniciar o Consumers de login:', error.message);
  }
};

module.exports = {
  startLoginConsumers
};
