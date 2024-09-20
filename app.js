const express = require('express');
const dotenv = require('dotenv');
const { connectKafka } = require('./src/config/kafka'); // Ajuste para a configuração Kafka
const { startRegisterConsumers } = require('./src/consumers/attendantsConsumers/registerConsumers'); // Ajuste para a inicialização dos consumidores Kafka
const { startLoginConsumers } = require('./src/consumers/attendantsConsumers/loginConsumers');
const attendantsRoutes = require('./src/routes/attendantsRoutes/authRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware para JSON
app.use(express.json());

// Rotas
app.use('/attendants', attendantsRoutes);

// Iniciar servidor e conectar ao Kafka
app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);

  try {
    // Conectar ao Kafka
    await connectKafka();
    console.log('Conectado ao Kafka');

    // Iniciar consumidores Kafka
    startRegisterConsumers();
    startLoginConsumers();
    console.log('Consumidores Kafka iniciados');

  } catch (error) {
    console.error('Erro ao conectar ao Kafka ou iniciar consumidores:', error.message);
  }
});