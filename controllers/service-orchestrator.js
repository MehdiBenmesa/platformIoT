const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883');
const deviceRegistry = require('../models/device-registery.js');
const databaseManager = require('./database-manager.js');
const serviceOrchestrator = {};
const serviceRegistry = {};



serviceOrchestrator.createCompositeService = (service) => {
    return databaseManager.saveCompositeService(service)
        .then((service) => {
            serviceOrchestrator.buildCompositeService(service);
            return service;
        }, (error) => {
            console.log(error);
        })
};

serviceOrchestrator.deleteCompositeService = (serviceName) => {
    return databaseManager.deleteCompositeService(serviceName)
        .then((result) => {
           delete serviceRegistry[serviceName];
           console.log(serviceRegistry);
           return result;
        });
};

serviceOrchestrator.updateCompositeService = (serviceName, service) => {
    return databaseManager.updateCompositeService(serviceName, service)
        .then((service) => {
           serviceOrchestrator.buildCompositeService(service);
           return service;
        }, (error) => {
            console.log(error);
        });
};

serviceOrchestrator.getAllCompositeServices = () => {
    return databaseManager.getAllCompositeServices();
};

serviceOrchestrator.createService = (deviceName, service) => {
    return deviceRegistry.addService(deviceName, service)
        .then((result) => {
            serviceOrchestrator.buildService({name :deviceName}, service);
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
    databaseManager.getAllCompositeServices()
        .then((services) => {
            for(let service of services){
                serviceOrchestrator.buildCompositeService(service);
            }
        }, (error) => {
            console.log(error);
        });
    console.log(serviceRegistry);
};

serviceOrchestrator.buildService = (device, service) => {
    client.subscribe(`service/${device.name}/${service.name}/up`);
    serviceRegistry[device.name][service.name] = (params) => {
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

serviceOrchestrator.buildCompositeService = (service) => {
    eval(`serviceRegistry['${service.name}'] = ${service.core}`);
    console.log(serviceRegistry);
};

serviceOrchestrator.removeService = (device, service) => {
   return delete serviceRegistry[device.name][service.name];
};

serviceOrchestrator.invokeService = (device, service, params) => {
    return serviceRegistry[device][service](params);
};

serviceOrchestrator.invokeCompositeService = (service, params) => {
  return serviceRegistry[service](params);
};

serviceOrchestrator.getRegistry = () => {
    return serviceRegistry;
};

module.exports = serviceOrchestrator;