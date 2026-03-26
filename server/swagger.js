const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Academic Compass API',
            version: '1.0.0',
            description: 'Smart Academic KPI Dashboard — REST API Documentation',
            contact: {
                name: 'Academic Compass Team'
            }
        },
        servers: [
            { url: 'http://localhost:5000/api', description: 'Development Server' }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                LoginRequest: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', example: 'admin@college.edu' },
                        password: { type: 'string', example: 'Admin@123' }
                    }
                },
                LoginResponse: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string', enum: ['student', 'faculty', 'admin'] },
                        token: { type: 'string' }
                    }
                },
                Student: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        rollNumber: { type: 'string' },
                        department: { type: 'string' },
                        yearOfStudy: { type: 'integer' },
                        cgpa: { type: 'number' },
                        attendance: { type: 'number' },
                        backlogs: { type: 'integer' }
                    }
                },
                PaginatedStudents: {
                    type: 'object',
                    properties: {
                        students: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Student' }
                        },
                        pagination: {
                            type: 'object',
                            properties: {
                                total: { type: 'integer' },
                                page: { type: 'integer' },
                                limit: { type: 'integer' },
                                totalPages: { type: 'integer' }
                            }
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                }
            }
        },
        security: [{ BearerAuth: [] }],
        paths: {
            '/users/login': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Login a user',
                    security: [],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/LoginRequest' }
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Successful login',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } }
                        },
                        401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
                    }
                }
            },
            '/students/dashboard': {
                get: {
                    tags: ['Student'],
                    summary: 'Get logged-in student dashboard data',
                    responses: {
                        200: { description: 'Student data with semesters and placement info' },
                        401: { description: 'Unauthorized' },
                        404: { description: 'Student not found' }
                    }
                }
            },
            '/admin/stats': {
                get: {
                    tags: ['Admin'],
                    summary: 'Get institution-wide KPI statistics',
                    responses: {
                        200: { description: 'KPIs, departmental CGPA, at-risk students, syllabus progress' },
                        401: { description: 'Unauthorized' },
                        403: { description: 'Forbidden — Admin only' }
                    }
                }
            },
            '/admin/students': {
                get: {
                    tags: ['Admin'],
                    summary: 'Search, filter, and paginate students',
                    parameters: [
                        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search by name, roll number, or email' },
                        { name: 'department', in: 'query', schema: { type: 'string' }, description: 'Filter by department (e.g. CSE, ECE)' },
                        { name: 'yearOfStudy', in: 'query', schema: { type: 'integer' }, description: 'Filter by year (1–4)' },
                        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Page number' },
                        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: 'Results per page (max 50)' }
                    ],
                    responses: {
                        200: {
                            description: 'Paginated student list',
                            content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedStudents' } } }
                        },
                        401: { description: 'Unauthorized' },
                        403: { description: 'Forbidden — Admin only' }
                    }
                }
            },
            '/admin/users': {
                get: {
                    tags: ['Admin'],
                    summary: 'Get all users (master table)',
                    responses: {
                        200: { description: 'Array of all users without passwords' },
                        403: { description: 'Forbidden — Admin only' }
                    }
                }
            },
            '/admin/users/{id}/status': {
                put: {
                    tags: ['Admin'],
                    summary: 'Update a user role or active status',
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        role: { type: 'string', enum: ['student', 'faculty', 'admin'] },
                                        active: { type: 'boolean' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        200: { description: 'Updated user object' },
                        404: { description: 'User not found' }
                    }
                }
            },
            '/admin/notify-individual': {
                post: {
                    tags: ['Admin'],
                    summary: 'Send an in-app message and email to a specific user',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['recipientId', 'title', 'message'],
                                    properties: {
                                        recipientId: { type: 'string' },
                                        title: { type: 'string' },
                                        message: { type: 'string' },
                                        type: { type: 'string', enum: ['Message', 'Alert', 'Warning'] }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        201: { description: 'Notification sent successfully' },
                        404: { description: 'Recipient not found' }
                    }
                }
            },
            '/admin/audit-logs': {
                get: {
                    tags: ['Admin'],
                    summary: 'Get recent admin audit trail (last 50 actions)',
                    responses: {
                        200: { description: 'Array of audit log entries' }
                    }
                }
            }
        }
    },
    apis: []
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
