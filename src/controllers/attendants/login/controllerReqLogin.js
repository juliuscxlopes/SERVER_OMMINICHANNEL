const { v4: uuidv4 } = require('uuid');
const sendMessage = require('../services/producer');
const { registerResponse } = require('../consumers/responseConsumer');

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const correlationId = uuidv4(); // Gera um correlationId para rastrear a requisição

  // Cria a mensagem com os dados de login
  const message = {
    action: 'login',
    data: { email, password }
  };

  try {
    // Envia a mensagem para Kafka com o correlationId no header
    await sendMessage(message, 'db_message', { correlationId });

    // Registrar a requisição para rastrear a resposta de Kafka
    registerResponse(correlationId, res);

    // Não enviar resposta imediatamente, aguarda resposta assincronamente
    console.log('Mensagem de login enviada para Kafka, aguardando resposta...');
  } catch (error) {
    // Caso haja erro no envio para Kafka, retornar erro ao cliente
    return res.status(500).json({ message: 'Erro ao processar a requisição.' });
  }
};

module.exports = {
  loginUser
};
