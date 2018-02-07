var express = require('express');
var router = express.Router();

var fs = require('fs');

var ip = require("ip");
var myip = ip.address();

var registeredDevices = [];

var exec = require('child_process').exec;

var AWS = require('aws-sdk');

// Replace with your ip address like so
var homeNetwork = '123.456.0.*';

// Place your AWS Key ID and secret access key here
AWS.config.update({ accessKeyId: '', secretAccessKey: '' });

var s3 = new AWS.S3();

fs.readFile('detected-devices.txt', function(err, data) {
    if (err) {
            console.log('No data available');
        } else {
            console.log("Restoring data from file:\n" + data.toString('ascii'));
            try{
                registeredDevices = JSON.parse(data)
                console.log("successfully restored data")
                console.log(registeredDevices);
            }catch(e){
                console.log("Unable to restore data from file" + e)
            }
        }
  });

var uploadToS3 = function(data){
  var base64data = new Buffer(data, 'binary');
  s3.putObject({

    //Place the name of the bucket within these quotes
    Bucket: '',
    //Place the name of the file in the bucket within these quotes

    Key: '',
    Body: JSON.stringify(data)
  },function (resp) {
    console.log(arguments);
    console.log('Successfully uploaded package.');
  });
  fs.writeFile('detected-devices.txt', JSON.stringify(data), function(err) {
      if (err){
          console.log('Error in writing file');
      } else {
          console.log('The file has been saved!');
      }
    });
}

var getDevices = function(cb){
    cb = cb || function(){};
    exec("sudo nmap -sP -n " + homeNetwork + " | awk '/Nmap scan report/{printf $5;printf \" \";getline;getline;print $3;}' ", function(err, stdout, stderr){
        if (err || stderr){
            console.log('error in invoking nmap command:' + err + stderr);
            return cb(err)
        }
        var now = Date.now();
        var lines = stdout.split("\n");
        lines.forEach(function(line){
            var values = line.split(" ")
            if (values[0] && values[1] && values[0] != myip){
                for( var i = 0, len = registeredDevices.length; i < len ; i++){
                    if (registeredDevices[i].mac == values[1]){
                        registeredDevices[i].isHome = true;
                        registeredDevices[i].lastSeen = now;
                        registeredDevices[i].ip = values[0];
                        break;
                    }
                }
                if (i == len){
                    registeredDevices.push({
                        name: 'Unregistered',
                        alias: 'none',
                        isHome: true,
                        lastSeen: now,
                        mac: values[1],
                        ip: values[0]
                    })
                }
            }
        })
        cb(null, registeredDevices);
    })
}

function checkDevices(){
    //cb = cb || function(){};
    getDevices(function(err, data){
        var now = Date.now(),
            uploadNeeded = false;
        registeredDevices.forEach(function(device){
            var lastStatus = device.status || "none";
            if (now - device.lastSeen <= 1800000){
                device.status = 'at home';
                if (lastStatus != device.status){
                    uploadNeeded = true;
                    console.log(device.name + " joined");
                }
            }else {
                device.status = 'last seen at ' + (new Date(device.lastSeen)).toLocaleString();
                if (lastStatus.indexOf('last seen at') == -1){
                    uploadNeeded = true;
                    console.log(device.name + " left");
                }
            }
        })

        if (uploadNeeded){
            console.log('uploading data to s3');
            uploadToS3(registeredDevices);
        }
        //cb(devices);
        setTimeout(function(){
            checkDevices()
        },60*1000);
    });
}

checkDevices();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Homepi', devices: registeredDevices });
});

router.post('/devices', function(req, res, next){
    console.log(req.body);
    var mac = req.body.macaddress.trim(),
        name = req.body.name.trim(),
        alias = req.body.alias.trim();
    for( var i = 0, len = registeredDevices.length; i < len ; i++){
        if (registeredDevices[i].mac == mac){
            registeredDevices[i].name = name;
            registeredDevices[i].alias = alias;
            break;
        }
    }
    if (i == len){
        registeredDevices.push({
            name: name,
            alias: alias,
            isHome: false,
            mac: mac
        })
    }
    uploadToS3(registeredDevices);
    res.render('thankyou', { title: 'Thank you for registering' });
});


module.exports = router;
