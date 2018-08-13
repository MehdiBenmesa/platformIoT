const express = require('express');
const router = express.Router();
const serviceOrchestrator = require('../controllers/service-orchestrator.js');
const dataLogger = require('../controllers/data-monitor.js');


router.get('/', (req, res) => {
    serviceOrchestrator.getAllCompositeServices()
        .then((services) => {
           res.json(services);
        });
});

router.post('/:device/:service/invoke', (req, res) => {
    serviceOrchestrator.invokeService(req.params.device, req.params.service, req.body)
        .then((result) => {
            let log = {
              device: req.params.device,
              service: req.params.service,
              input : req.body,
              output: result
            };
            dataLogger.log(log);
            res.json(result);
        });
});


router.post('/composite/add', (req, res) => {
   serviceOrchestrator.createCompositeService(req.body)
       .then((result) => {
          res.json(result);
       });
});

router.post('/:service/invoke', (req, res) => {
    serviceOrchestrator.invokeCompositeService(req.params.service, req.body)
        .then((result) => {
            let log = {
                service: req.params.service,
                input : req.body,
                output: result
            };
            dataLogger.log(log);
            res.json(result);
        });
});

router.put('/:service', (req, res) => {
   serviceOrchestrator.updateCompositeService(req.params.service, req.body)
       .then((result) => {
           res.json(result);
       })
});

router.delete('/:service', (req, res) => {
   serviceOrchestrator.deleteCompositeService(req.params.service)
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