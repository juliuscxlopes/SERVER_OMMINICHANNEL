const express = require('express');
const dotenv = require('dotenv');
const { connectKafka } = require('./src/config/kafka');
const attendantsRoutes = require('./src/routes/attendantsRoutes/authRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware para JSON
app.use(express.json());

// Rotas
app.use('/attendants', attendantsRoutes);

// Função para iniciar consumidores
const startConsumers = async (consumers) => {
  for (const consumer of consumers) {
    await consumer(); // Chama a função de cada consumidor
  }
};

// Iniciar servidor e conectar ao Kafka
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);

  try {
    // Conectar ao Kafka
    await connectKafka();
    console.log('Conectado ao Kafka');

  } catch (error) {
    console.error('Erro ao conectar ao Kafka ou iniciar consumidores:', error.message);
  }
});
