const express = require('express');
const router = express.Router();
const serviceOrchestrator = require('../controllers/service-orchestrator.js');

router.post('/:device/:service', (req, res) => {
    console.log(req.body);
    serviceOrchestrator.invokeService(req.params.device, req.params.service, req.body)
        .then((result) => {
            res.json(result);
        });
});

module.exports = router;