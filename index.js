const deviceManager = require('./controllers/device-manager.js');
const serviceOrchestrator = require('./controllers/service-orchestrator.js');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/iot-platform');
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
    console.log('Connection is established to the database');
});

deviceManager.start().then(() => {
    serviceOrchestrator.start();
});

const deviceRouter = require('./routes/device-router.js');
app.use('/device', deviceRouter);

const serviceRouter = require('./routes/service-router.js');
app.use('/service', serviceRouter);

const monitorRouter = require('./routes/monitor-route.js');
app.use('/monitor', monitorRouter);

app.get('/', (req, res) => res.send('Hello World!'));
app.listen(3000, () => console.log('Listening on port 3000!'));