"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
async function start() {
    try {
        console.log(`Connecting to MongoDB at ${env_1.config.mongodbUri}...`);
        await mongoose_1.default.connect(env_1.config.mongodbUri);
        console.log('MongoDB connected successfully.');
        app_1.default.listen(env_1.config.port, () => {
            console.log(`ConnectIQ Backend listening on port ${env_1.config.port} in ${env_1.config.nodeEnv} mode.`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Start only if directly executed
if (require.main === module) {
    start();
}
