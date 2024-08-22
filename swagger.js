const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Autobots API",
      version: "1.0.0",
      description: "API documentation for the Autobots project",
    },
    servers: [
      {
        url: "http://localhost:3000", // Replace with your actual server URL
      },
    ],
  },
  apis: ["./server.js"], // Path to the API routes (adjust according to your project structure)
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;
