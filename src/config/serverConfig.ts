import dotenv from "dotenv"

dotenv.config();

export default{
    PORT:process.env.PORT || 3000,
    REDIS_HOST: process.env.REDIS_HOST || '127.0.0.1',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || "6379", 10),
    NODE_ENV:process.env.NODE_ENV,
    PROBLEM_ADMIN_SERVICE_URL: process.env.PROBLEM_ADMIN_SERVICE,
    SOCKET_SERVICE_URL:process.env.SOCKET_SERVICE,
    EVALUATOR_SERVICE_URL:process.env.EVALUATOR_SERVICE,
    SUBMISSION_SERVICE_URL:process.env.SUBMISSION_SERVICE
    
}