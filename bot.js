'use strict';
const express = require('express');
const crypto = require('crypto');
var request = require('request');
const util = require('util');
var webhookRouter = express.Router();

var send = function(jsonBody, pageID) {
  console.log("Send Message: ", util.inspect(jsonBody, {depth: null}));
  let pageAccessToken = "";

  // choose page access token based on pageID (aka recipient.id)
  switch (pageID) {
    case "141562053314580": // @messengerdiscovertoken
      pageAccessToken = process.env.PAT_MESSENGER_DISCOVER_TOKEN;
      break;
    case "607251572939276": // @messengerstripe
      pageAccessToken = process.env.PAT_MESSENGER_STRIPE;
      break;
    case "603723139959837": // @messengerpaypal
      pageAccessToken = process.env.PAT_MESSENGER_PAYPAL;
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
              "text": "PAGE ID: " + pageID + " PSID: " + senderID
            }
          };
          send(response, pageID);
          break;
        case "BUY_BUTTON":
          var response = {
            "messaging_type": "RESPONSE",
            "recipient":{
              "id": senderID
            },
            "message":{
              "attachment":{
                "type":"template",
                "payload":{
                  "template_type":"generic",
                  "elements":[{
                    "title":"T-Shirt",
                    "image_url":"https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Blue_Tshirt.jpg/220px-Blue_Tshirt.jpg",
                    "subtitle":"Blue",
                    "buttons":[{
          	        	"type":"payment",
          		        "title":"Buy Now",
          		        "payload":"BUY_BUTTON_PAYLOAD",
          		        "payment_summary":{
          		          "currency":"USD",
          		          "payment_type":"FLEXIBLE_AMOUNT",
          		          "is_test_payment" : true,
          		          "merchant_name":"Payments Test",
          		          "requested_user_info":[
          		            "shipping_address",
          		            "contact_name",
          		            "contact_phone",
          		            "contact_email"
          		          ],
        	              "price_list":[
          	              {
          	                "label":"Subtotal",
          	                "amount":"1.00"
          	              },
          	              {
          	                "label":"Taxes",
          	                "amount":".07"
        	                }
        	              ]
        	            }
                    }]
                  }]
                }
              }
            }
          };
          send(response, pageID);
          break;
        default:
          console.log("Unknown postback: " + event.postback.payload);
      }
    }

    if (event.pre_checkout) {
      var response = {
        "success": true
      };
      send(response, pageID);
    }


    if (event.checkout_update) {
      var response = {
        "recipient":{
          "id": senderID
        },[
        "shipping":[
          {
            "option_id":"1",
            "option_title":"Standard",
            "price_list":[
              {
                "label":"Shipping",
                "amount":"1.10"
              }
            ]
          },
          {
            "option_id":"2",
            "option_title":"Express",
            "price_list":[
              {
                "label":"Shipping",
                "amount":"1.20"
              }
            ]
          }
        ]]
      };
      send(response, pageID);
    }

    if (event.payment) {
      // TODO: process payment
    }
  })
  res.sendStatus(200);
});

module.exports = webhookRouter;
