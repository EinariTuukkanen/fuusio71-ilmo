// ============================
// >> WELCOME PAGE
// ============================


// Helper function to insert users in html table
function insertUserToTable(id, index, user) {
    $("#" + id).find('tbody')
    .append($('<tr>')
        .append($('<td>')
            .text(function() {
                if (index > MAX_USERS) return index + ' (jono)';
                return index;
            })
        )
        .append($('<td>')
            .text(user.name.substring(0, 36))
            .css('word-break', 'break-word')
        )
        .append($('<td>')
            .text(user.table.substring(0, 36))
            .css('word-break', 'break-all')
        )
        .css('borderBottom', function() {
            if (index === MAX_USERS) return '4px dashed #dd3b26';
            return '1px solid #1f0044';
        })
    );
}


// On page load get users and insert them to table
$(function() {
    $.ajax({
        url: API_BASE_URL + '/users',
        type: "GET",
        success: function(response) {
            var rawUsersData = JSON.parse(response);

            var usersData = rawUsersData.sort(
                function(a, b) {
                    return a.timestamp - b.timestamp;
                }
            );

            var inviteGuests = rawUsersData.filter(function(a) {
                return a.guildStatus === 'inviteGuest';
            });

            var guildMembers = rawUsersData.filter(function(a) {
                return a.guildStatus === 'currentMember';
            });

            $('#registrationButtonContainer').removeClass('hidden');

            for (var i = 0; i < inviteGuests.length; i++) {
                insertUserToTable('registeredInviteGuests', i + 1, inviteGuests[i]);
            }

            var inviteGuestsCount = inviteGuests.length;

            for (var i = 0; i < guildMembers.length; i++) {
                insertUserToTable('registeredGuildMembers', i + 1, guildMembers[i]);
            }
        },
        error: function(response) {
            console.error('ERROR', response);
        },
    });
});


$('#text-backdrop').text(backdropText);


