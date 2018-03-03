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
