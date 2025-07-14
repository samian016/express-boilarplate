const express = require("express");
const { PORT } = require("./config");
const errorHandler = require("./utils/errors");
const cors = require("cors");
require("./utils/connection");
const activityLogger = require("./utils/activity-logger");
const expressApp = require("./express-app");
const eventsToHandle = ['SIGTERM', 'SIGINT', 'unhandledRejection', 'uncaughtException', 'SIGUSR2'];
const SearchCTRL = require("./search/search");
var admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");
const { fcmController } = require("./utils/fcmController");

var serviceAccount = require(`${process.cwd()}/src/config/${process.env.FIREBASE_SERVICE_ACCOUNT}`);
const fcm = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
let search = null;
try {
    search = new SearchCTRL();
    search.start()
        .then(() => {
            console.log("=> Search controller started");
        });
} catch (err) {
    console.error("Error initializing search controller:", err);
}
eventsToHandle.forEach(async e => process.on(e, async orgErr => {
    try {
        console.log(orgErr);
        await search.save().catch(e => console.log({ e }));
        return process.exit();
    }
    catch (e) {
        console.log(e);
        return process.exit();
    }
}));

console.log("Initializing the api service");



const app = express();

app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Allowed methods
    allowedHeaders: '*'     // Allowed headers
}));
app.use(express.json({ limit: '50mb' }));

app.use(activityLogger);
expressApp(app, search, fcmController(getMessaging));
errorHandler(app);

app.listen(PORT, () => {
    console.log(`listening to port ${PORT}`)
})
    .on("error", (err) => {
        console.log(err)
        process.exit()
    })
    .on("close", () => {
        // channel.close();
    })