const { getProducer } = require('../../../config/kafka');
const { v4: uuidv4 } = require('uuid');

// Função para enviar dados para um tópico Kafka com callback
const sendToKafkaTopic = (topic, message, headers, callback) => {
  const producer = getProducer();
  producer.send({
    topic: topic,
    messages: [{ value: JSON.stringify(message), headers }]
  })
  .then(() => {
    console.log('Mensagem enviada para o tópico Kafka:', message);
    callback(null, { status: 200, message: 'Request processed successfully' });
  })
  .catch(error => {
    console.error('Erro ao enviar mensagem para o Kafka:', error);
    callback(error, null);
  });
};

const registerUser = (req, res) => {
  const { name, email, password } = req.body;
  const correlationId = uuidv4();

  // Enviar dados para o tópico de autenticação
  sendToKafkaTopic('db_message', {
    action: 'register',
    data: { name, email, password }
  }, { correlationId }, (error, response) => {
    if (error) {
      return res.status(500).json({ message: 'Erro ao processar a requisição.' });
    }
    
    // Retornar a resposta ao cliente
    res.status(response.status).json({ message: response.message });
  });
};


module.exports = {
  registerUser,
};
