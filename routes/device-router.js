const express = require('express');
const router = express.Router();
const deviceManager = require('../controllers/device-manager.js');
const serviceOrchestrator = require('../controllers/service-orchestrator.js');

router.get('/', (req, res) => {
    res.json(deviceManager.getCurrentDevices());
});

router.delete('/:name', (req, res) => {
    deviceManager.removeDevice(req.params.name).then((result) => {
        if(result) res.json(result);
    })
});

router.post('/:name/services', (req, res) => {
    serviceOrchestrator.createService(req.params.name, req.body).then((result) => {
       res.json(result);
    });
});

router.delete('/:name/services/:service', (req, res) => {
    serviceOrchestrator.deleteService(req.params.name, req.params.service).then((result) => {
       res.json(result);
    });
});

module.exports = router;