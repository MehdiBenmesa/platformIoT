const databaseManager = require('../controllers/database-manager.js');

const deviceRegistry = {
    devices : new Set()
};

deviceRegistry.add = (device) => {
    let ret = deviceRegistry.check(device);
    if (!ret){
        databaseManager.saveDevice(device)
            .then((_device) => {
                deviceRegistry.devices.add(_device);
                deviceRegistry.check(_device);
            }, (error) => {
                throw error;
            });
    }
};

deviceRegistry.init = () => {
    return databaseManager.loadAllDevices()
        .then( (devices) => {
            devices.forEach((_device) => {
                deviceRegistry.devices.add(_device);
            });
            return devices;
        });
};

deviceRegistry.remove = (name) => {
    return databaseManager.deleteDevice(name)
        .then( (result) => {
            deviceRegistry.devices.forEach((device) => {
                if(device.name === name) deviceRegistry.devices.delete(device);
            });
            if(result.deleted){
                console.log(deviceRegistry.devices);
                return result;
            }
        },(error) => {
            console.error(error);
        });
};

deviceRegistry.check = (_device) => {
    for (let device of deviceRegistry.devices){
        if (device.name === _device.name ) {
            if(device.status === 'down') device.status = 'up';
            return true;
        }
    }
    return false;
};

deviceRegistry.getDevices = () => {
    return [... deviceRegistry.devices];
};

deviceRegistry.setDown = (name) => {
    for (let device of deviceRegistry.devices){
        if(device.name === name ){
            device.status = 'down';
            break;
        }
    }
};

deviceRegistry.addService = (name, service) => {
    for (let device of deviceRegistry.devices){
        if(device.name === name) {
            device.services.push(service);
            return databaseManager.addServiceToDevice(name, service)
                .then((result) => {
                    return result;
                }, (error) => {
                    console.error(error);
                })
        }
    }
};

deviceRegistry.removeService = (deviceName, serviceName) => {
  for (let device of deviceRegistry.devices){
      if(device.name === deviceName){
          for (let service of device.services) {
                if(service.name === serviceName){
                    device.services.filter((service) => {
                        return service.name !==serviceName
                    });
                    return databaseManager.removeServiceFromDevice(deviceName,serviceName)
                        .then((result) => {
                            return result;
                        }, (error) => {
                           console.error(error);
                        });
                }
          }
      }
  }
};

module.exports = deviceRegistry;