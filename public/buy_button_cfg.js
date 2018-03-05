// the Messenger Extensions JS SDK is done loading
window.extAsyncInit = function() {
  loadConfig();
};

try {
  function loadConfig() {

    MessengerExtensions.getContext('148998055817543',
      function success(thread_context){
        $('#callLog').prepend('<li>loadConfig</li>');

        $.get("/webhook/pay-config/" + thread_context.psid, function( data ) {
          $('#callLog').prepend('<li>pay-config: ' + JSON.stringify(data, null, 4) + '</li>');

          data['is_test_payment'] ? $("#cb_test").prop('checked', true) : $("#cb_test").prop('checked', false);
          $.inArray('shipping_address', data.requested_user_info) === -1 ? $("#cb_shipping").prop('checked', false) : $("#cb_shipping").prop('checked', true);
          $.inArray('contact_name', data.requested_user_info) === -1 ? $("#cb_name").prop('checked', false) : $("#cb_name").prop('checked', true);
          $.inArray('contact_email', data.requested_user_info) === -1 ? $("#cb_email").prop('checked', false) : $("#cb_email").prop('checked', true);
          $.inArray('contact_phone', data.requested_user_info) === -1 ? $("#cb_phone").prop('checked', false) : $("#cb_phone").prop('checked', true);
        });
      },
      function error(err){
        $('#errorLog').prepend('<li>' + err + '</li>');
      }
    );
  }
} catch (e) {
	$('#errorLog').prepend('<li>loadConfig error: ' + e.message + '</li>');
}



try {
  function saveConfig() {

    MessengerExtensions.getContext('148998055817543',
      function success(thread_context){
        $('#callLog').prepend('<li>saveConfig</li>');

        var requested_user_info = [];

        // Set options from checkbox values.
        var is_test_payment = $("#cb_test").is(':checked') ? true : false;
        if ($("#cb_shipping").is(':checked')){
          requested_user_info.push("shipping_address");
        }
        if ($("#cb_name").is(':checked')){
          requested_user_info.push("contact_name");
        }
        if ($("#cb_email").is(':checked')){
          requested_user_info.push("contact_email");
        }
        if ($("#cb_phone").is(':checked')){
          requested_user_info.push("contact_phone");
        }

        $.ajax({
          type: "POST",
          url: '/webhook/pay-config/save/' + thread_context.psid,
          data: {requested_user_info:JSON.stringify(requested_user_info), is_test_payment:is_test_payment},
        });
      },
      function error(err){
        $('#errorLog').prepend('<li>' + err + '</li>');
      }
    );
  }
} catch (e) {
	$('#errorLog').prepend('<li>saveConfig error: ' + e.message + '</li>');
}
