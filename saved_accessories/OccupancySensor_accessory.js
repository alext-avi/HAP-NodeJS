var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

// here's a fake temperature sensor device that we'll expose to HomeKit
var FAKE_SENSOR = {
  occupancy: Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED,
  getOccupancy: function() { 
    console.log("Getting the occupancy!");
    return FAKE_SENSOR.occupancy;
  },
  getIsOccupied: function() {
    return FAKE_SENSOR.occupancy == Characteristic.OccupancyDetected.OCCUPANCY_DETECTED;
  },  
  setOccupied: function() {
      console.log("Setting occupied.");
      FAKE_SENSOR.occupied = Characteristic.OccupancyDetected.OCCUPANCY_DETECTED;
  },
  setUnoccupied: function() {
      console.log("Setting unoccupied.");
      FAKE_SENSOR.occupied = Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED;
  },
  identify: function() {
    console.log("Identify the sensor!");
  }
}


// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var sensorUUID = uuid.generate('hap-nodejs:accessories:occupancy-sensor1');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new Accessory('Occupancy Sensor', sensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "C1:5D:3A:AE:5E:FA";
sensor.pincode = "031-45-154";

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
  .addService(Service.OccupancySensor)
  .getCharacteristic(Characteristic.OccupancyDetected)
  .on('get', function(callback) {
    
    // return our current value
    callback(null, FAKE_SENSOR.getOccupancy());
  });
  

// listen for the "identify" event for this Accessory
sensor.on('identify', function(paired, callback) {
  FAKE_SENSOR.identify();
  callback(); // success
});

// Add the actual Lightbulb Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
  .addService(Service.Lightbulb, "Fake Light") // services exposed to the user should have "names" like "Fake Light" for us
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
      if(value)
            FAKE_SENSOR.setOccupied();
      else
        FAKE_SENSOR.setUnoccupied();
    callback(); // Our fake Light is synchronous - this value has been successfully set
  });

// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
sensor
  .getService(Service.Lightbulb)
  .getCharacteristic(Characteristic.On)
  .on('get', function(callback) {
    
    // this event is emitted when you ask Siri directly whether your light is on or not. you might query
    // the light hardware itself to find this out, then call the callback. But if you take longer than a
    // few seconds to respond, Siri will give up.
    
    var err = null; // in case there were any problems
    
    if (FAKE_SENSOR.powerOn) {
      console.log("Are we on? Yes.");
      callback(err, true);
    }
    else {
      console.log("Are we on? No.");
      callback(err, false);
    }
  });
