const express = require('express');
const router = express.Router();
const serviceOrchestrator = require('../controllers/service-orchestrator.js');

router.post('/:device/:service', (req, res) => {
    serviceOrchestrator.invokeService(req.params.device, req.params.service, req.body)
        .then((result) => {
            res.json(result);
        });
});

router.post('/composite', (req, res) => {
   serviceOrchestrator.createCompositeService(req.body)
       .then((result) => {
          res.json(result);
       });
});
router.get('/test', (req, res) => {
   let registry = serviceOrchestrator.getRegistry();
   let device1 = registry.device1;
   device1.testService(" ").then((result1) => {
        device1.testService2(" ").then((result2) => {
            let result = result1 + result2;
            res.json({result});
        });
   });
});

module.exports = router;