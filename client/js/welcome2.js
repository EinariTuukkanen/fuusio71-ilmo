// ============================
// >> WELCOME PAGE
// ============================


var guildStatusRank = {
    'currentMember': 1,
    'exMember': 2,
    'other': 3,
    '': 3,
}

// Helper function to insert users in html table
function insertUserToTable(index, table, user, excess, prioLimit) {
    var row = table.insertRow(-1);
    var cellIndex = row.insertCell(0);
    var cellName = row.insertCell(1);
    var cellTable = row.insertCell(2);

    cellIndex.innerHTML = index;
    cellName.innerHTML = user.name.substring(0, 36);
    cellName.style.wordBreak = 'break-word';
    cellTable.innerHTML = user.table.substring(0, 36);
    cellTable.style.wordBreak = 'break-all';

    if (excess) {
        row.style.backgroundColor = '#ffe7e7';
    }
    if (prioLimit) {
        row.style.borderBottom = '3px solid #000'
    }
}

// On page load get users and insert them to table
$(function() {
    var table = document.getElementById('registeredUsers');
    $.ajax({
        url: API_BASE_URL + '/users',
        type: "GET",
        success: function(response) {
            var rawUsersData = JSON.parse(response);
            var preUsers = rawUsersData.filter(
                function(u) {
                    return !!u.preRegistration;
                }
            );
            var preUsers = preUsers.sort(
                function(a, b) {
                    return a.timestamp - b.timestamp;
                }
            );

            var regularUsers = rawUsersData.filter(
                function(u) {
                    return !u.preRegistration;
                }
            );
            var regularUsers = regularUsers.sort(
                function(a, b) {
                    var aRank = guildStatusRank[a.guildStatus];
                    var bRank = guildStatusRank[b.guildStatus];
                    if (aRank !== bRank) {
                        return aRank - bRank;
                    } else {
                        return a.timestamp - b.timestamp;
                    }
                }
            );
            var usersData = preUsers.concat(regularUsers);

            var priorityUsers = usersData.filter(
                function(u) {
                    return !!u.preRegistration || u.guildStatus === 'currentMember';
                }
            );
            var count = priorityUsers.length;
            console.log('pre-registration + current members : ' + count);
            if (priorityUsers.length < 456 && (new Date()).getTime() >= 1485770400000) {
                $('#registrationButtonContainer').removeClass('hidden');
            }
            var excess = false;
            var prioLimit = false;
            for (var i = 0; i < usersData.length; i++) {
                if (i >= 455) {
                    excess = true;
                }
                if (i == count - 1) {
                    prioLimit = true;
                }
                insertUserToTable(i + 1, table, usersData[i], excess, prioLimit);
                prioLimit = false;
            }
       
        },
        error: function(response) {
            console.error('ERROR', response);
   
        },
    });
});
