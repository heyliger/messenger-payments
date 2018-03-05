try {
  function loadConfig() {

    MessengerExtensions.getContext('148998055817543',
      function success(thread_context){
        $('#callLog').prepend('<li>loadConfig</li>');

        $.get("/webhook/pay-config/", function( data ) {
          $('#callLog').prepend('<li>pay-config: ' + data + '</li>');

          if (data['is_test']){

          }
          $.inArray('shipping_address', data.config) ? $("#cb_shipping").prop('checked', true) : $("#cb_shipping").prop('checked', false);
          $.inArray('contact_name', data.config) ? $("#cb_name").prop('checked', true) : $("#cb_name").prop('checked', false);
          $.inArray('contact_email', data.config) ? $("#cb_email").prop('checked', true) : $("#cb_email").prop('checked', false);
          $.inArray('contact_phone', data.config) ? $("#cb_phone").prop('checked', true) : $("#cb_phone").prop('checked', false);

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

        var config = [];

        // Set options from checkbox values.
        var is_test = $("#cb_test").is(':checked') ? true : false;
        if ($("#cb_shipping").is(':checked')){
          config.push("shipping_address");
        }
        if ($("#cb_name").is(':checked')){
          config.push("contact_name");
        }
        if ($("#cb_email").is(':checked')){
          config.push("contact_email");
        }
        if ($("#cb_phone").is(':checked')){
          config.push("contact_phone");
        }

        $.ajax({
          type: "POST",
          url: '/webhook/pay-config/save/' + thread_context.psid,
          data: {config:JSON.stringify(config), is_test:is_test},
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
