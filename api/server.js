require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const basicAuth = require('express-basic-auth');
const cors = require('cors');
const transcriptRoutes = require('./routes/transcript');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Basic authentication setup (only if credentials are provided)
if (process.env.API_USERNAME && process.env.API_PASSWORD) {
  app.use(basicAuth({
    users: { [process.env.API_USERNAME]: process.env.API_PASSWORD },
    challenge: true,
    unauthorizedResponse: 'Unauthorized access'
  }));
  console.log('API authentication enabled');
} else {
  console.log('API authentication disabled - no credentials set');
}

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'YouTube Transcript API',
      version: '1.0.0',
      description: 'REST API for retrieving YouTube video transcripts',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        basicAuth: {
          type: 'http',
          scheme: 'basic',
          description: 'Basic authentication for API access',
        },
      },
    },
    security: process.env.API_USERNAME && process.env.API_PASSWORD ? [{ basicAuth: [] }] : [],
  },
  apis: ['./api/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api', transcriptRoutes);

// Root redirect to API docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Start server
app.listen(PORT, () => {
  console.log(`YouTube Transcript API running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});

module.exports = app; 