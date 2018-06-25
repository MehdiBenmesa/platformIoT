const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeviceSchema = new Schema({
   name : {type: String, unique: true},
   status : {type: String, default : 'down'},
   services : [{
       name: {type: String, unique: true, required: true},
       params: [{
           name: String,
           paramType: String
       }],
       returnType: String
   }]
});

const DeviceModel = mongoose.model('device', DeviceSchema);

const databaseManager = {};

databaseManager.saveDevice = (options) => {
    return new Promise((resolve, reject) => {
        let device = new DeviceModel(options);
        device.save((error, device) => {
            if (error) {
                return reject(error);
            }
            resolve(device);
        });
    });
};

databaseManager.deleteDevice = (name) => {
    return new Promise((resolve, reject) => {
       DeviceModel.deleteOne({name: name}, (error) => {
           if(error) {
               return reject(error);
           }
           resolve({deleted: true});
       });
    });
};

databaseManager.loadAllDevices = () => {
    return new Promise((resolve, reject) => {
        DeviceModel.find({}, (error, devices) => {
            if(error) return reject(error);
            resolve(devices);
        });
    });
};

databaseManager.addServiceToDevice = (name, service) => {
    return new Promise((resolve, reject) => {
       DeviceModel.findOneAndUpdate(
           {name: name},
           {
                $push : {services : service}
           }, {new : true}, (error , result ) => {
               if(error) reject(error);
               resolve(result);
           });
    });
};

databaseManager.removeServiceFromDevice = (deviceName, serviceName) => {
    return new Promise((resolve, reject) => {
       DeviceModel.findOneAndUpdate(
           {name: deviceName},
           {
               $pull :{services: {name : serviceName}}
           }, {new : true}, (error, result) => {
               if(error) reject(error);
               resolve(result);
        }
       )
    });
};
module.exports = databaseManager;