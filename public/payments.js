function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
  sURLVariables = sPageURL.split('&'),
  sParameterName,
  i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
};

var pageID = getUrlParameter('page_id');
var giftPrice = 1;
var currentShippingOption = '';
var details = null;

/**
 * The payment options configuration.
 */
var methodData =
[{
  supportedMethods: ['fb'],
  data: {
    merchantTitle: 'Payments Test',
    merchantImageUrl: 'https://en.facebookbrand.com/wp-content/uploads/2016/09/messenger_icon2.png',
    confirmationText: 'Thank you!',
    termsUrl: "https://www.facebook.com/terms.php",
    merchantFBPageId: pageID,
  }
}];

/**
 * The additional payment options configuration.
 */
var additionalOptions = {
  requestShipping: false, // if shipping is required
  requestPayerName: false, // name of the payer sent with the final response
  requestPayerEmail: false, // email address
  requestPayerPhone: false, // phone number
};

/**
 * Shipping option configurations.
 */
const standardShipping = {
  id: 'standard',
  label: 'Standard shipping',
  amount: {currency: 'USD', value: '1.10'},
};
const expressShipping = {
  id: 'express',
  label: 'Express shipping',
  amount: {currency: 'USD', value: '1.20'},
  selected: true,
}

/**
* Calculate tax of the item.
*
* @param {String} price Cost of the item being purchased.
* @returns {String} Tax of the item.
*/
const calculateTax = (price) => {
  return (price * .07).toFixed(2);
};

/**
* Calculate total price including shipping and tax of the item.
*
* @param {String} price Cost of the item being purchased.
* @param {String} shipping Shipping cost of the item being purchased.
* @returns {String} Total price including shipping and tax of purchased item.
*/
const calculateTotal = (price, shipping) => {
  return (price * 1.07 + parseFloat(shipping)).toFixed(2);
};

/**
* Build payment details based on gift price.
*
* @param {String} price Price of the item being purchased.
* @param {Object} shipping Selected shipping option.
* @returns {Object} paymentDetails passed into the SDK payment request.
*/
const paymentDetails = (price, shipping) => {

  if (shipping) {
    return {
      displayItems: [
        {
          label: 'T-Shirt',
          amount: {
            currency: 'USD',
            value : price
          },
        },
        {
          label: 'Sales Tax',
          amount: {
            currency: 'USD',
            value : calculateTax(price)
          },
        },
       shipping
      ],
      total: {
        label: 'Total due',
        amount: {
          currency: 'USD',
          value : calculateTotal(price, shipping.amount.value)
        },
      },
      shippingOptions: [standardShipping, expressShipping]
    };

  } else {
    return {
      displayItems: [
        {
          label: 'T-Shirt',
          amount: {
            currency: 'USD',
            value : price
          },
        },
        {
          label: 'Sales Tax',
          amount: {
            currency: 'USD',
            value : calculateTax(price)
          },
        }
      ],
      total: {
        label: 'Total due',
        amount: {
          currency: 'USD',
          value : calculateTotal(price, 0)
        },
      }
    };
  }
};

window.extAsyncInit = function() {
  $('#callLog').prepend('<li>sdk loaded</li>');
};

try {
  function makePayment() {
    $('#callLog').prepend('<li>makePayment</li>');

    // Set options from checkbox values.
    additionalOptions.requestShipping = $("#cb_shipping").is(':checked') ? true : false;
    additionalOptions.requestPayerName = $("#cb_name").is(':checked') ? true : false;
    additionalOptions.requestPayerEmail = $("#cb_email").is(':checked') ? true : false;
    additionalOptions.requestPayerPhone = $("#cb_phone").is(':checked') ? true : false;

    if (additionalOptions.requestShipping === true) {
      // default shipping option to standard
      currentShippingOption = standardShipping.id;
      details = paymentDetails(giftPrice, standardShipping);
    } else {
      details = paymentDetails(giftPrice, null);
    }
    $('#callLog').prepend('<li>Payment details: ' + JSON.stringify(details, null, 4) + '</li>');
    let request = new MessengerExtensions.PaymentRequest( methodData, details, additionalOptions);

    // The user has aborted the flow.
    request.addEventListener('checkoutcancel', () => {
      $('#callLog').prepend('<li>Checkout cancel</li>');
    });

    // Register shipping address change callback
    request.addEventListener('shippingaddresschange', function(evt) {
      evt.updateWith(new Promise(function(resolve, reject) {
        const address = evt.target.shippingAddress;
        // re-calculate shipping cost based on address change.
        $('#callLog').prepend('<li>Shipping address change</li>');

        if (currentShippingOption === standardShipping.id) {
          details = paymentDetails(giftPrice, standardShipping);
        } else {
          details = paymentDetails(giftPrice, expressShipping);
        }
        resolve(details);
      }));
    });

    // Register shipping option change callback
    request.addEventListener('shippingoptionchange', function(evt) {
      evt.updateWith(new Promise(function(resolve, reject) {
        const option = evt.target.shippingOption;
        // re-calculate shipping cost based on option change
        $('#callLog').prepend('<li>Shipping option change</li>');

        // update shipping type
        if (option === standardShipping.id) {
          details = paymentDetails(giftPrice, standardShipping);
        } else {
          details = paymentDetails(giftPrice, expressShipping);
        }
        currentShippingOption = option;
        resolve(details);
      }));
    });

    request.canMakePayment().then((response) => {
      $('#callLog').prepend('<li>canMakePayment</li>');

      if (response === true) {
        request.show().then(function(paymentResponse) {
          var res = JSON.stringify(paymentResponse, null, 4);
          $('#callLog').prepend('<li>' + res + '</li>');
          // Process the payment if using tokenized payments.
          // Process the confirmation if using Stripe/PayPal

          paymentResponse.complete('success').then(function() {
            $('#callLog').prepend('<li>paymentResponse complete</li>');
          });
        }).catch(function(error) {
          $('#errorLog').prepend('<li>error: ' + error + '</li>');
        });
      } else {
        // something went wrong, e.g. invalid `displayItems` configuration
        // or the person's phone does not run a recent enough version of the app
        $('#errorLog').prepend('<li>Response false</li>');
      }
    })
    .catch((error) => {
      // an error such as `InvalidStateError` if a payment is already in process
      $('#errorLog').prepend('<li>error: ' + error + '</li>');
    });
  }
}
catch (e) {
	$('#errorLog').prepend('<li>makePayment error: ' + e.message + '</li>');
}
