// подключение модулей
require("dotenv").config() // env
const swaggerJsdoc = require("swagger-jsdoc"); // swagger
const swaggerUi = require('swagger-ui-express');
const express = require('express'); // express
const app = express();
const todoRouter = require('./src/routes/todo.js'); // todo
const PORT = process.env.PORT;
const dbRouter = require('./src/database/queries.js'); // запросы

// routers
app.use(express.json());
app.use('/api',todoRouter);
app.use('/api',dbRouter);

// подключение swagger
const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'To do API',
        version: '1.0.0',
        description: "API для todo листа",
      },
      servers: [
        {
          url: process.env.URL,
        },
      ],
    },
    apis: ['./src/schemas/schemas.js'],
  };
  
const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});