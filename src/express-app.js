const express = require("express");
const {
    user,
    role
} = require("./routers");
const path = require("path");
const { asyncMiddleware } = require("./middlewares");
var morgan = require('morgan');

module.exports = (app, search = null, ws = null) => {
    app.use(morgan(':method :url :status  -:response-time ms'));
    app.use(express.json());
    app.use("/files", express.static(path.join(__dirname, "../")));

    app.use("/api", (apiRouter => {
        user(apiRouter, search, ws);
        role(apiRouter, search, ws);
        return apiRouter;
    })(express.Router()));

    app.get("/", (req, res) => res.status(200).send("Welcome to the api."))
    // error handling
}
