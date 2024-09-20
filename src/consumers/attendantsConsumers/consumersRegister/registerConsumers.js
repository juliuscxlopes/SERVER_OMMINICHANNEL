require('dotenv').config();
const axios = require('axios');
const { getConsumer } = require('../../../config/kafka');
const redis = require('../../../redis/redisConfig'); // Importar o Redis

const startRegisterConsumers = async () => {
  try {
    const consumer = getConsumer();

    // Configurar o consumidor para ler do tópico 'db_message'
    await consumer.subscribe({ topic: 'db_message', fromBeginning: true });
    console.log('Consumidor inscrito no tópico db_message.');

    // Processar as mensagens recebidas do tópico
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log('Mensagem recebida no Consumers.');

        const messageContent = JSON.parse(message.value.toString());
        const correlationId = message.headers.correlationId.toString();

        console.log(`Processando mensagem com correlationId: ${correlationId}`);
        console.log(`Dados recebidos:`, messageContent);

        if (messageContent.action === 'register') {
          const { name, email, password } = messageContent.data;
          console.log(`Processando cadastro de: ${name}, ${email}`);

          try {
            // Enviar dados para a API de registro
            const response = await axios.post(process.env.DB_OMMINICHANNEL_REGISTER, { name, email, password });

            const result = {
              status: response.status === 201 ? 201 : 400,
              message: response.status === 201 ? 'Usuário cadastrado com sucesso' : response.statusText
            };

            // Atualizar o estado no Redis
            await redis.set(correlationId, JSON.stringify(result));
            console.log(`Estado no Redis atualizado com sucesso para o correlationId: ${correlationId}`);

          } catch (error) {
            console.error('Erro ao enviar solicitação para a API de registro:', error.message);

            const result = {
              status: error.response && error.response.status === 400 ? 400 : 500,
              message: error.response ? error.response.data.message : error.message
            };

            // Atualizar o estado no Redis com erro
            await redis.set(correlationId, JSON.stringify(result));
            console.log(`Estado no Redis atualizado com erro para o correlationId: ${correlationId}`);
          }
        }
      }
    });

    console.log('Consumers de registro iniciado.');

  } catch (error) {
    console.error('Erro ao iniciar o Consumers de registro:', error.message);
  }
};

module.exports = {
  startRegisterConsumers
};
