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

var paymentDetails =
{
  displayItems: [
    {
      label: 'T-shirt',
      amount: {
        currency: 'USD',
        value : '1.00'
      },
    }
  ],
  total: {
    label: 'Total due', // defaults to "Total"
    amount: {
      currency: 'USD',
      value : '1.00'
    },
  },
};

var additionalOptions = {
  requestShipping: false, // if shipping is required
  requestPayerName: true, // name of the payer sent with the final response
  requestPayerEmail: true, // email address
  requestPayerPhone: false, // phone number
};

window.extAsyncInit = function() {
  $('#callLog').prepend('<li>sdk loaded</li>');
};

try {
  function makePayment() {
    $('#callLog').prepend('<li>makePayment</li>');
    let request = new MessengerExtensions.PaymentRequest( methodData, paymentDetails, additionalOptions);

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
          $('#errorLog').prepend('<li>error' + error + '</li>');
        });
      } else {
        // something went wrong, e.g. invalid `displayItems` configuration
        // or the person's phone does not run a recent enough version of the app
        $('#errorLog').prepend('<li>response false</li>');
      }
    })
    .catch((error) => {
      // an error such as `InvalidStateError` if a payment is already in process
      $('#errorLog').prepend('<li>' + error + '</li>');
    });
  }
}
catch (e) {
	$('#errorLog').prepend('<li>makePayment error: ' + e.message + '</li>');
}
