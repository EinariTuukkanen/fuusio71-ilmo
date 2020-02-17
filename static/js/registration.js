// ============================
// >> REGISTRATION FORM
// ============================

function createUser() {
  // Create placeholder user
  console.debug('Creating new user..');
  $.ajax({
    url: API_BASE_URL + '/users',
    type: 'POST',
    contentType: 'application/json',
    success: function(response) {
      var data = JSON.parse(response);
      // Save session
      localStorage.setItem('fuusioUserId', data.userId);
      updateInfoText(data.timestamp);
    },
    error: function(response) {
      console.error('Error', response);
    },
  });
}

function updateInfoText(userTime) {
  $.ajax({
    url: API_BASE_URL + '/usersCount',
    type: 'GET',
    success: function(userCount) {
      var timestamp = Math.floor(Date.now() / 1000);
      var diff = timestamp - userTime;

      var leftMins = parseInt(30 - diff / 60);
      // console.log('Still time left: ', leftMins);
      // console.log(userTime, userCount);
      var count = userCount === '0' ? 'X' : userCount;

      $('#registrationInfo').text(
        'Olet jonossa sijalla ' +
          count +
          ', täytä ilmoittautumislomake alla vahvistaaksesi ilmoittautumisen. ' +
          'Sinulla on ' +
          leftMins +
          ' minuuttia aikaa ennen lomakkeen vanhentumista.'
      );
    },
    error: function(response) {
      console.error('Error', response);
    },
  });
}

function showPrivacy(e) {
  e.preventDefault();
  alert(
    "Ilmoittamasi nimi sekä pöytäseurue näytetään julkisena ilmoittautumisen etusivulla. Halutessasi voit käyttää salanimeä ja kirjoittaa oikeat tiedot 'Lisätietoja' kenttään.\n\nLuovuttamiasi tietoja käsitellään asianmukaisesti eikä niitä luovuteta eteenpäin.\n\nTietoja säilytetään EU:n sisällä DigitalOceanin palvelimilla.\n\nTietoja säilytetään tapahtuman jälkeen kunnes laskutus on valmis.\n\nTarkistaaksesi, muokataksesi tai poistaaksesi tietosi, ota yhteyttä rekisterinpitäjään: Einari Tuukkanen / enkkut@gmail.com"
  );
}

$(function() {
  var userId = localStorage.getItem('fuusioUserId');

  if (!!userId) {
    // Existing session found
    // Find existing user by id
    $.ajax({
      url: API_BASE_URL + '/users/' + userId,
      type: 'GET',
      contentType: 'application/json',
      success: function(response) {
        var data = JSON.parse(response);
        if ($.isEmptyObject(data)) {
          // Userid was not found
          localStorage.removeItem('fuusioUserId');
          console.debug('Invalid userid!', userId);
          createUser();
          return;
        }
        var timestamp = Math.floor(Date.now() / 1000);
        var diff = timestamp - data.timestamp;

        // 30 min timeout
        if (diff > SESSION_TIMEOUT) {
          localStorage.removeItem('fuusioUserId');
          console.debug('Timeout!');
          createUser();
        } else {
          updateInfoText(data.timestamp);
        }
      },
      error: function(response) {
        console.error('Error, user not found', response);
        //localStorage.removeItem('fuusioUserId');
        //console.debug('Invalid userid!', userId);
        //createUser();
        //return
      },
    });
  } else {
    // New session!
    // Create placeholder user
    createUser();
  }
});

// Floating label headings for the registration form
$(function() {
  $('body')
    .on('input propertychange', '.floating-label-form-group', function(e) {
      $(this).toggleClass(
        'floating-label-form-group-with-value',
        !!$(e.target).val()
      );
    })
    .on('focus', '.floating-label-form-group', function() {
      $(this).addClass('floating-label-form-group-with-focus');
    })
    .on('blur', '.floating-label-form-group', function() {
      $(this).removeClass('floating-label-form-group-with-focus');
    });
});

// Helper to convert formData to object
$.fn.serializeObject = function() {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
    if (o[this.name] !== undefined) {
      if (!o[this.name].push) {
        o[this.name] = [o[this.name]];
      }
      o[this.name].push(this.value || '');
    } else {
      o[this.name] = this.value || '';
    }
  });
  return o;
};

// Form validator
$(function() {
  $(
    '#registrationForm input,#registrationForm select,#registrationForm checkbox,#registrationForm textarea'
  ).jqBootstrapValidation({
    preventSubmit: true,
    submitError: function($form, event, errors) {
      alert('Ole hyvä ja täytä tähdellä (*) merkityt pakolliset kohdat');
      // additional error messages or events
    },
    submitSuccess: function($form, event) {
      event.preventDefault(); // prevent default submit behaviour
      // get values from FORM
      var name = $('input#name').val();
      // var email = $("input#email").val();
      // var phone = $("input#phone").val();
      // var message = $("textarea#message").val();
      var formData = $('form').serializeObject();

      // console.debug('formData: ', formData);

      var userId = localStorage.getItem('fuusioUserId');

      if (!userId) {
        alert('Ilmoittautuminen ei onnistunut, ilmo ei ole auki.');
        return;
      }
      var data = { formData: formData, userId: userId };

      $.ajax({
        url: API_BASE_URL + '/users',
        type: 'PUT',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function(response) {
          console.debug(response);
          // Success message
          $('#success').html("<div class='alert alert-success'>");
          $('#success > .alert-success')
            .html(
              "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;"
            )
            .append('</button>');
          $('#success > .alert-success').append(
            '<strong>Ilmoittautumisesi on vastaanotettu. </strong>'
          );
          $('#success > .alert-success').append('</div>');

          $('#submitForm').hide();
          localStorage.removeItem('fuusioUserId');

          //clear all fields
          $('#registrationForm').trigger('reset');

          var redirect = location.href.split('/');
          redirect.pop();
          location.href = redirect.join('/');
        },
        error: function(response) {
          console.error('ERROR', response);
          // Fail message
          $('#success').html("<div class='alert alert-danger'>");
          $('#success > .alert-danger')
            .html(
              "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;"
            )
            .append('</button>');
          $('#success > .alert-danger').append(
            '<strong>Pahoittelut, palvelin ei vastaa tai ilmo on kiinni, yritä myöhemmin uudestaan!</strong>'
          );
          $('#success > .alert-danger').append('</div>');

          //clear all fields
          $('#registrationForm').trigger('reset');
        },
      });
    },
    filter: function() {
      return $(this).is(':visible');
    },
  });

  $('a[data-toggle="tab"]').click(function(e) {
    e.preventDefault();
    $(this).tab('show');
  });
});

/*When clicking on Full hide fail/success boxes */
// $('#name').focus(function() {
//     $('#success').html('');
// });

// Form actions

// function showHistoryOrderAddress(postType) {
//     if (postType == 'deliverPost') {
//         $('.history-order-address').removeClass('hidden');
//     } else {
//         $('.history-order-address').addClass('hidden');
//     }
// }

function showCoffeeAvec() {
  const alcoholStatus = $('#drinkMenu').val();
  if (alcoholStatus == 'alcoholic') {
    $('#coffeeAvec').removeClass('hidden');
  } else {
    $('#coffeeAvec').addClass('hidden');
  }
}
$(function() {
  $('#drinkMenu').change(showCoffeeAvec);
});

if (inviteGuestIsOn) {
  document.getElementById('inviteGuest').disabled = false;
  if (!guildMemberIsOn) document.getElementById('inviteGuest').checked = true;
  // $("#status").append(
  //   $("<option>", {
  //     value: "inviteGuest",
  //     text: "Kutsuvieras"
  //   })
  // );
}

if (guildMemberIsOn) {
  document.getElementById('guildMember').disabled = false;
  if (!inviteGuestIsOn) document.getElementById('guildMember').checked = true;
  // $("#status").append(
  //   $("<option>", {
  //     value: "currentMember",
  //     text: "Fyysikkokillan nykyinen jäsen"
  //   })
  // );
  // $("#status").append(
  //   $("<option>", {
  //     value: "avec",
  //     text: "Fyysikkokiltalaisen avec"
  //   })
  // );
}

if (isRegistrationOn) {
  // $("#status").append(
  //   $("<option>", {
  //     value: "company",
  //     text: "Yritysedustaja"
  //   })
  // );
  $('#inviteRegistrationDisclaimer').remove();
}

$('#text-backdrop').text(backdropText);
