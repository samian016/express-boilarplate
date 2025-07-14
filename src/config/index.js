const dotEnv = require("dotenv")

if (process.env.NODE_ENV !== "prod") {
    const configFile = `./.env.${process.env.NODE_ENV}`
    dotEnv.config({ path: configFile })
} else {
    dotEnv.config({ path: "./.env" });
}

console.log("-> ", process.env.MONGODB_URI, " <-");

module.exports = {
    PORT: process.env.PORT ?? 8005,
    DB_URL: process.env.MONGODB_URI ?? "mongodb://root:Abc13579@ec2-13-251-36-210.ap-southeast-1.compute.amazonaws.com:27017/rain-forest?authSource=admin",
    APP_SECRET: process.env.APP_SECRET ?? "boilarplate",
    EXCHANGE_NAME: process.env.EXCHANGE_NAME ?? "UPOS",
    MSG_QUEUE_URL: process.env.MSG_QUEUE_URL ?? "amqp://localhost:5672",
    USER_SERVICE: "user-service",
    CV_TEMPLATE_SERVICE: "cvTemplate-service",
    RESET_PASS_SECRET: process.env.RESET_PASS_SECRET ?? "2024",
    SMTP_HOST: process.env.SMTP_HOST ?? "smtp.example.com",
    SMTP_PORT: process.env.SMTP_PORT ?? 587,
    SMTP_USER: process.env.SMTP_USER ?? "",
    SMTP_PASSWORD: process.env.SMTP_PASSWORD ?? "",
}
