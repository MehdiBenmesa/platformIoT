const express = require('express');
const router = express.Router();
const dataMonitor = require('./../controllers/data-monitor.js');

router.get('/:device/:service', (req, res) => {
    dataMonitor.getServiceLog(req.params.service, req.params.device).then((records) => {
        res.json(records);
    }, (error) => {
        console.log(error);
    });
});

router.get('/:service', (req, res) => {
    dataMonitor.getCompositeServiceLog(req.params.service).then((records) => {
        res.json(records);
    }, (error) => {
        console.log(error);
    });
});

module.exports = router;