'use strict';
const express = require('express');
const crypto = require('crypto');
var request = require('request');
const util = require('util');
var webhookRouter = express.Router();

var send = function(jsonBody, recipientID, pageID) {
  console.log("Send Message: ", util.inspect(jsonBody, {depth: null}));
  let pageAccessToken = "";

  // choose page access token based on pageID (aka recipient.id)
  switch (pageID) {
    case 141562053314580: // @messengerdiscovertoken
      pageAccessToken = process.env.PAT_MESSENGER_DISCOVER_TOKEN;
      break;
    default:
      console.log("Unknown Page ID");
      return;
  }

  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {
      access_token: pageAccessToken
    },
    method: 'POST',
    json: jsonBody
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error);
    } else if (response.body.error) {
      console.log('Received error: ', response.body.error);
    }
  });
};

webhookRouter.get('/config.js', function(req, res) {
  res.send("var PAGE_ACCESS_TOKEN='" + process.env.PAGE_ACCESS_TOKEN + "'; " + "var FB_APP_ID='" + process.env.FB_APP_ID + "';");
});

webhookRouter.post('/', function(req, res) {

  let messagingEvents = req.body.entry[0].messaging;
  messagingEvents.forEach(function(event) {

    console.log('Event: ' + util.inspect(event));
    let senderID = event.sender.id;
    let pageID = event.recipient.id;

    if (event.postback) {
      switch (event.postback.payload) {
        case "GET_STARTED":
          var response = {
            "messaging_type": "RESPONSE",
            "recipient": {
              "id": senderID
            },
            "message": {
              "text": "Choose from the menu below."
            }
          };
          send(response, pageID);
          break;
        case "GET_PSID":
          var response = {
            "messaging_type": "RESPONSE",
            "recipient": {
              "id": senderID
            },
            "message": {
              "text": "PAGE ID: " + pageID + " PSID:" + senderID
            }
          };
          send(response, pageID);
          break;
        default:
          console.log("Unknown postback: " + event.postback.payload);
      }
    }
  })
  res.sendStatus(200);
});

module.exports = webhookRouter;
