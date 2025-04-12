require("dotenv").config()
const todoRouter = require('./src/routes/todo.js'); 
const swaggerJsdoc = require("swagger-jsdoc");
const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const PORT = 3000;


app.use(express.json());
app.use('/api',todoRouter);



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