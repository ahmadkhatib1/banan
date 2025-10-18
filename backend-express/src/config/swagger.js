const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Educational Platform API',
    version: '1.0.0',
    description: 'API documentation for the Educational Platform backend',
    contact: {
      name: 'Educational Platform Team',
      email: 'support@eduplatform.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: process.env.API_BASE_URL || 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme',
      },
    },
    schemas: {
      User: {
        type: 'object',
        required: ['email', 'password', 'firstName', 'lastName'],
        properties: {
          id: {
            type: 'integer',
            description: 'User ID',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
          },
          firstName: {
            type: 'string',
            description: 'User first name',
          },
          lastName: {
            type: 'string',
            description: 'User last name',
          },
          role: {
            type: 'string',
            enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'],
            description: 'User role',
          },
          isActive: {
            type: 'boolean',
            description: 'User active status',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'User creation date',
          },
        },
      },
      Course: {
        type: 'object',
        required: ['title', 'description', 'instructorId'],
        properties: {
          id: {
            type: 'integer',
            description: 'Course ID',
          },
          title: {
            type: 'string',
            description: 'Course title',
          },
          description: {
            type: 'string',
            description: 'Course description',
          },
          instructorId: {
            type: 'integer',
            description: 'Instructor ID',
          },
          isPublished: {
            type: 'boolean',
            description: 'Course published status',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Course creation date',
          },
        },
      },
      Lesson: {
        type: 'object',
        required: ['title', 'content', 'courseId'],
        properties: {
          id: {
            type: 'integer',
            description: 'Lesson ID',
          },
          title: {
            type: 'string',
            description: 'Lesson title',
          },
          content: {
            type: 'string',
            description: 'Lesson content',
          },
          courseId: {
            type: 'integer',
            description: 'Course ID',
          },
          order: {
            type: 'integer',
            description: 'Lesson order in course',
          },
          videoUrl: {
            type: 'string',
            description: 'Video URL for lesson',
          },
        },
      },
      Quiz: {
        type: 'object',
        required: ['title', 'questions', 'lessonId'],
        properties: {
          id: {
            type: 'integer',
            description: 'Quiz ID',
          },
          title: {
            type: 'string',
            description: 'Quiz title',
          },
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: {
                  type: 'string',
                  description: 'Question text',
                },
                options: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Answer options',
                },
                correctAnswer: {
                  type: 'integer',
                  description: 'Index of correct answer',
                },
              },
            },
          },
          lessonId: {
            type: 'integer',
            description: 'Lesson ID',
          },
        },
      },
      Progress: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'Progress ID',
          },
          userId: {
            type: 'integer',
            description: 'User ID',
          },
          courseId: {
            type: 'integer',
            description: 'Course ID',
          },
          lessonId: {
            type: 'integer',
            description: 'Lesson ID',
          },
          isCompleted: {
            type: 'boolean',
            description: 'Completion status',
          },
          completedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Completion date',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          message: {
            type: 'string',
            description: 'Error message',
          },
          error: {
            type: 'string',
            description: 'Error details',
          },
        },
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          message: {
            type: 'string',
            description: 'Success message',
          },
          data: {
            type: 'object',
            description: 'Response data',
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// Options for the swagger docs
const options = {
  definition: swaggerDefinition,
  // Path to the API files
  apis: [
    './src/routes/*.js',
    './src/routes/**/*.js',
    './src/models/*.js',
  ],
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

// Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'none',
    filter: true,
    showRequestDuration: true,
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0 }
    .swagger-ui .scheme-container { background: #fafafa; padding: 30px 0 }
  `,
  customSiteTitle: 'Educational Platform API Documentation',
};

module.exports = {
  swaggerSpec,
  swaggerUi,
  swaggerUiOptions,
};