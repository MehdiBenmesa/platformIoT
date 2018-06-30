const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');
const deviceRegistry = require('../models/device-registery.js');
const serviceOrchestrator = {};
const serviceRegistry = {};

serviceOrchestrator.createService = (deviceName, service) => {
    return deviceRegistry.addService(deviceName, service)
        .then((result) => {
            serviceOrchestrator.buildService({name:deviceName}, service);
            client.publish(`device/${deviceName}/service`, JSON.stringify(service));
            return result;
        });
};

serviceOrchestrator.deleteService = (deviceName, serviceName) => {
    return deviceRegistry.removeService(deviceName, serviceName)
        .then((result) => {
            serviceOrchestrator.removeService({name: deviceName}, {name: serviceName});
            client.publish(`device/${deviceName}/service/delete`, JSON.stringify({serviceName: serviceName}));
            return result;
        });
};

serviceOrchestrator.start = () => {
    for (let device of deviceRegistry.getDevices()) {
        serviceRegistry[device.name] = {};
        for (let service of device.services){
            serviceOrchestrator.buildService(device, service);
        }
    }
    console.log(serviceRegistry);
};

serviceOrchestrator.buildService = (device, service) => {
    client.subscribe(`service/${device.name}/${service.name}/up`);
    serviceRegistry[device.name][service.name] = (params) => {
        console.log('hi');
        client.publish(`service/${device.name}/${service.name}/down`, JSON.stringify(params));
        return new Promise((resolve, reject) => {
           client.on('message', (topic, message) => {
               message = JSON.parse(message);
              if(topic === `service/${device.name}/${service.name}/up`){
                  resolve(message);
              }
           });
        });
    }
};

serviceOrchestrator.removeService = (device, service) => {
   return delete serviceRegistry[device.name][service.name];
};

serviceOrchestrator.invokeService = (device, service, params) => {
  return serviceRegistry[device][service](params);
};

module.exports = serviceOrchestrator;