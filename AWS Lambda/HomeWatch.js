'use strict';

const Alexa = require('alexa-sdk');
const AWS = require('aws-sdk');

const s3 = new AWS.S3();

//need to replace with your APP ID
const APP_ID = undefined;

const statusList = {
    'en': {
        translation: {
            POSSIBLESTATUS: [
                ' is Home',
                ' is not at home',
            ],
            SKILL_NAME: 'HomePi',
            GET_ANSWER_MESSAGE: "let me have a look: ",
            HELP_MESSAGE: 'You can ask me if someone is home or, you can say exit... What can I help you with?',
            HELP_REPROMPT: 'What can I help you with?',
            POST_ANSWER_MESSAGE: '........ is there anything else I can help you with?',
            STOP_MESSAGE: 'Goodbye!',
        },
    },
};

var readTable = function(callback) {

    // Retrieve the bucket & key for the uploaded S3 object that
    // caused this Lambda function to be triggered

    //Place the name of the bucket within these quotes
    var src_bkt = "";
    //Place the name of the file in the bucket within these quotes
    var src_key = "";

    var jsonObj = {};

    // Retrieve the object
    s3.getObject({
        Bucket: src_bkt,
        Key: src_key
    }, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            callback(err);
        } else {
            console.log("Raw text:\n" + data.Body.toString('ascii'));
            try{
                jsonObj = JSON.parse(data.Body)
            }catch(e){
                console.log("Unable to parse s3 object" + e)
            }
            callback(null, jsonObj);
        }
    });
};

const handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', this.t('HELP_REPROMPT'));
    },

    // Name of your first Intent
    'WhoHome': function () {
        this.emit('homeStatus');
    },

    // Name of your second Intent
    'WhoAllHome': function () {
        this.emit('homeList');
    },

    //searches for a person
    'homeStatus': function () {

        //Who the user is asking about
        var name = '',
            status = '',
            self = this;

        const statusPossible = this.t('POSSIBLESTATUS');
        const leadingMessage = this.t('GET_ANSWER_MESSAGE');
        const trailingMessage = this.t('POST_ANSWER_MESSAGE');

        if (this.event.request.intent.slots.name.value==null){
            name = 'mom';
            const speechOutput = 'Could you please repeat that?';
            self.emit(':ask', speechOutput)
        } else{
            name = this.event.request.intent.slots.name.value.toLowerCase();
        }

        //reads through the table to find a name
        readTable(function(err, obj){
            if(!err && obj){
                for(var i = 0, len = obj.length; i < len; i++){
                    if (obj[i].name.toLowerCase() == name || obj[i].alias.toLowerCase() == name){
                        break;
                    }
                }
            }
            if (i<len && obj[i].isHome){
                status = statusPossible[0]
            } else if(i<len){
                status = statusPossible[1]
            } else {
                const speechOutput = 'I don\'t seem to know who ' + name + ' is. You can ask me about someone I do know.';
                self.emit(':ask', speechOutput)
            }

            // Create speech output
            const speechOutput = leadingMessage + name + status + trailingMessage;
            self.emit(':ask', speechOutput)
        })
    },

    //Lists everyone at home
    'homeList': function () {

        var self = this,
            namesNum = 0;

        let speechOutput = 'hmm...';

        readTable(function(err, obj){
            if(!err && obj){
                for(var i = 0, len = obj.length; i < len; i++){
                    if (obj[i].name.toLowerCase() != 'unregistered' && obj[i].isHome){
                        speechOutput = speechOutput + ' , ' + obj[i].name;
                        namesNum++;
                    }
                }
            };
            // Create speech output
            if (namesNum >= 1){
                speechOutput = speechOutput + ' are home at the moment ';
            } else {
                speechOutput = speechOutput + ' is home at the moment ';
            }
            self.emit(':ask', speechOutput)
        })
    },


    'AMAZON.HelpIntent': function () {
        const speechOutput = this.t('HELP_MESSAGE');
        const reprompt = this.t('HELP_MESSAGE');
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },
    'AMAZON.NoIntent': function () {
        this.emit(':tell', this.t('STOP_MESSAGE'));
    },

};

exports.handler = function (event, context) {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.resources = statusList;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
