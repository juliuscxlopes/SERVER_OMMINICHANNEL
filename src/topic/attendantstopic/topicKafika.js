// createTopic.js
const { Kafka } = require('kafkajs');

// Configuração do Kafka
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID, // Use variável de ambiente
  brokers: [process.env.KAFKA_BROKER_URL] // Ex: 'localhost:9092'
});

// Criar o admin client
const admin = kafka.admin();

const createTopic = async (topicName) => {
  try {
    // Conectar ao Kafka admin client
    await admin.connect();
    console.log('Conectado ao Kafka admin client');

    // Criar o tópico com configurações adicionais
    await admin.createTopics({
      topics: [{
        topic: topicName,
        numPartitions: 1, // Número de partições
        replicationFactor: 1 // Fator de replicação
      }],
    });
    console.log(`Tópico ${topicName} criado com sucesso`);

  } catch (error) {
    console.error('Erro ao criar o tópico:', error.message);
  } finally {
    // Desconectar do Kafka admin client
    await admin.disconnect();
    console.log('Desconectado do Kafka admin client');
  }
};

// Criar o tópico 'db_message' e 'controller_responses'
const createTopics = async () => {
  await createTopic('db_message');
  await createTopic('controller_responses');
};

createTopics().catch(console.error);
