const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');
const deviceRegistry = require('../models/device-registery.js');

const serviceOrchestrator = {};
serviceOrchestrator.createService = (deviceName, service) => {
    return deviceRegistry.addService(deviceName, service)
        .then((result) => {
            client.publish(`device/${deviceName}/service`, JSON.stringify(service));
            return result;
        });
};

serviceOrchestrator.deleteService = (deviceName, serviceName) => {
    return deviceRegistry.removeService(deviceName, serviceName)
        .then((result) => {
            client.publish(`device/${deviceName}/service/delete`, JSON.stringify({serviceName: serviceName}));
            return result;
        });
};

module.exports = serviceOrchestrator;