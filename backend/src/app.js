"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const roles_routes_1 = __importDefault(require("./routes/roles.routes"));
const organizations_routes_1 = __importDefault(require("./routes/organizations.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const dataSources_routes_1 = __importDefault(require("./routes/dataSources.routes"));
const destinations_routes_1 = __importDefault(require("./routes/destinations.routes"));
const pipelines_routes_1 = __importDefault(require("./routes/pipelines.routes"));
const notifications_routes_1 = __importDefault(require("./routes/notifications.routes"));
const accountSettings_routes_1 = __importDefault(require("./routes/accountSettings.routes"));
const response_1 = require("./utils/response");

const app = (0, express_1.default)();

app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));

app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());

// Platform health endpoint
app.get('/api/health', (req, res) => {
    return (0, response_1.sendSuccess)(res, { status: 'healthy' });
});

// Mount auth module routes under /api/auth
app.use('/api/auth', auth_routes_1.default);

// Mount users routes under /api/organizations, /organizations, and standalone /api/me /me
app.use('/api/organizations', users_routes_1.default);
app.use('/organizations', users_routes_1.default);
app.use('/api', users_routes_1.default);
app.use('/', users_routes_1.default);

// Mount data source routes under /api/organizations and /organizations
app.use('/api/organizations', dataSources_routes_1.default);
app.use('/organizations', dataSources_routes_1.default);

// Mount destination routes under /api/organizations and /organizations
app.use('/api/organizations', destinations_routes_1.default);
app.use('/organizations', destinations_routes_1.default);

// Mount pipelines routes under /api/v1, /api, /organizations, and root
app.use('/api/v1/organizations', pipelines_routes_1.default);
app.use('/api/v1', pipelines_routes_1.default);
app.use('/api', pipelines_routes_1.default);
app.use('/organizations', pipelines_routes_1.default);

// Mount notifications routes under /api/organizations, /organizations, /api, and root
app.use('/api/organizations', notifications_routes_1.default);
app.use('/organizations', notifications_routes_1.default);
app.use('/api', notifications_routes_1.default);
app.use('/', notifications_routes_1.default);

// Mount Organization/RBAC module routes under /api/organizations or /organizations
app.use('/api/organizations', organizations_routes_1.default);
app.use('/organizations', organizations_routes_1.default);

// Keep roles endpoint logic compatible if mounted at organization level by old route too
app.use('/api/organizations', roles_routes_1.default);
app.use('/organizations', roles_routes_1.default);

// Mount account settings routes under /api and root
app.use('/api', accountSettings_routes_1.default);
app.use('/', accountSettings_routes_1.default);

// 404 handler
app.use((req, res) => {
    return (0, response_1.sendError)(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled application error:', err);
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return (0, response_1.sendError)(res, message, status);
});

exports.default = app;
