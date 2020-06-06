$(document).ready(function() {

    var sessionSecret = document.cookie
        .split('; ')
        .find(row => row.startsWith('sessionSecret'));
    if (sessionSecret != undefined) {
        sessionSecret = sessionSecret.split('=')[1];
    }
    var username = document.cookie
        .split('; ')
        .find(row => row.startsWith('username'));
    if (username != undefined) {
        username = username.split('=')[1];
    } else {
        window.location.replace("../");
    }
    if (sessionSecret === undefined)
        window.location.replace("../");

    $("#logoutButton").click(function() {
        document.cookie = "sessionSecret=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.replace("../");
    })

    $("#goToFeed").click(function() {
        window.location.replace("../feed/");
    })

    $("#username").text(username);



    $.ajax({
        type: "GET",
        url: "../api/getFriends.php",
        data: {
            "username": username,
        },
        success: function(responseData, textStatus, jqXHR) {
            if (responseData.status == true) {
                var temp = document.getElementById('friendList');
                noPosts = document.createElement("div");
                noPosts.innerText = "No  friends! Try sending a few friend requests!";
                noPosts.classList.add("card", "card-body", "mb-2");
                temp.appendChild(noPosts);
                // putFriendsDataToDOM({ "member2": "No friends :(", "added": "Try sending friend requests!" }, username, "friendList");
            } else {
                if (responseData.length > 0) {
                    for (i = 0; i < responseData.length; i++) {
                        putFriendsDataToDOM(responseData[i], username, "friendList");
                    }
                } else {
                    var temp = document.getElementById('friendList');
                    noPosts = document.createElement("div");
                    noPosts.innerText = "No  friends! Try sending a few friend requests!";
                    noPosts.classList.add("card", "card-body", "mb-2");
                    temp.appendChild(noPosts);
                }
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
    $.ajax({
        type: "GET",
        url: "../api/getAllUsers.php",
        success: function(responseData, textStatus, jqXHR) {
            if (responseData.length > 1) {
                for (i = 0; i < responseData.length; i++) {
                    putAllUserDataToDOM(responseData[i], username, "allUserList");
                }
            } else {
                // putAllUserDataToDOM({ "username": "No new users on platform", "password": null }, username, "allUserList");
                var temp = document.getElementById('allUserList');
                noPosts = document.createElement("div");
                noPosts.innerText = "No new users on platform!";
                noPosts.classList.add("card", "card-body");
                temp.appendChild(noPosts);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // $("#tweetCharsLeft").text(JSON.stringify(errorThrown));
            console.log(errorThrown);
        }
    })

    $.ajax({
        type: "GET",
        url: "../api/getRequests.php",
        data: {
            "sentTo": username,
        },
        success: function(responseData, textStatus, jqXHR) {
            if (responseData.status == true) {
                var temp = document.getElementById('requestList');
                noPosts = document.createElement("div");
                noPosts.innerText = "No Pending Friend requests";
                noPosts.classList.add("card", "card-body");
                temp.appendChild(noPosts);
            } else {
                if (responseData.length > 0) {
                    for (i = 0; i < responseData.length; i++) {
                        putRequestDataToDOM(responseData[i], username, "requestList");
                    }
                } else {
                    // putRequestDataToDOM({ "sentFrom": "No new friend requests", "password": null }, username, "requestList");
                }
            }

        },
        error: function(jqXHR, textStatus, errorThrown) {
            // $("#tweetCharsLeft").text(JSON.stringify(errorThrown));
            console.log(errorThrown);
        }
    })


})

function putFriendsDataToDOM(singleCard, username, parentname) {
    if (username == singleCard.member2) {
        otherFriend = singleCard.member1;
    } else {
        otherFriend = singleCard.member2;
    }
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    var card = document.createElement("div");
    card.classList.add("card", "shadow-sm", "mb-3");
    var cardBody = document.createElement("div");
    cardBody.classList.add("card-body");
    var cardTitle = document.createElement("div");

    cardTitle.innerText = otherFriend;
    cardTitle.classList.add("card-title");
    var cardSubTitle = document.createElement("div");
    var a = new Date(); // Current date now.
    var b = new Date(singleCard['added']);
    var d = Math.abs(b - a);
    if (d / 1000 < 60)
        singleCard.added = ("Friends since " + (d / 1000).toFixed(0) + " seconds");
    else if (d / 60000 < 60)
        singleCard.added = ("Friends since " + (d / 60000).toFixed(0) + " minutes");
    else if (d / 1440000 < 24)
        singleCard.added = ("Friends since " + (d / 1440000).toFixed(0) + " hours");
    else if (a.getUTCFullYear() - b.getUTCFullYear() < 1)
        singleCard.added = b.getDate() + " " + monthNames[b.getMonth()];
    else singleCard.posted = monthNames[b.getMonth()] + " " + b.getUTCFullYear();
    cardSubTitle.innerText = singleCard.added;
    cardSubTitle.classList.add("card-subtitle", "mb-2", "text-muted");
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardSubTitle);
    card.appendChild(cardBody);

    var parent = document.getElementById(parentname);
    parent.appendChild(card);
}

function putAllUserDataToDOM(singleCard, username, parentname) {
    if (singleCard.username != username) {
        var card = document.createElement("div");
        card.classList.add("card", "shadow-sm", "mb-3");

        var cardBody = document.createElement("div");
        cardBody.classList.add("card-body", "d-flex", "justify-content-between");

        var cardTitle = document.createElement("div");
        cardTitle.innerText = singleCard.username;
        cardTitle.classList.add("card-title");
        cardBody.appendChild(cardTitle);

        var addFriend = document.createElement("div");
        addFriend.classList.add("btn", "btn-primary", "px-3", "py-1", "addFriend");
        addFriend.innerText = "Add Friend";
        addFriend.setAttribute("id", "add_" + singleCard.username);
        addFriend.setAttribute("onclick", "addFriend(this)")
        cardBody.appendChild(addFriend);

        card.appendChild(cardBody);

        var parent = document.getElementById(parentname);
        parent.appendChild(card);
    }
}


function putRequestDataToDOM(singleCard, username, parentname) {
    var card = document.createElement("div");
    card.classList.add("card", "shadow-sm", "mb-3");

    var cardBody = document.createElement("div");
    cardBody.classList.add("card-body", "d-flex", "justify-content-between");

    var cardTitle = document.createElement("div");
    cardTitle.innerText = singleCard.sentFrom;
    cardTitle.classList.add("card-title");
    cardTitle.setAttribute("id", "requestFrom_" + singleCard.sentFrom);
    cardBody.appendChild(cardTitle);

    if (singleCard.password === undefined) {
        var buttonHolder = document.createElement("div");
        buttonHolder.classList.add("d-flex", "align-items-center");

        var addFriend = document.createElement("div");
        addFriend.classList.add("btn", "btn-success", "px-2", "py-1", "mr-2", "mb-2", "mb-md-0");
        addFriend.innerText = "Accept";
        addFriend.setAttribute("id", "accept_" + singleCard.sentFrom);
        addFriend.setAttribute("onclick", "acceptRequest(this)");
        buttonHolder.appendChild(addFriend);

        var removeFriend = document.createElement("div");
        removeFriend.classList.add("btn", "btn-danger", "px-2", "py-1", "mb-2", "mb-md-0");
        removeFriend.innerText = "Reject";
        removeFriend.setAttribute("id", "reject_" + singleCard.sentFrom);
        removeFriend.setAttribute("onclick", "rejectRequest(this)");
        buttonHolder.appendChild(removeFriend);

        cardBody.appendChild(buttonHolder);
    }




    card.appendChild(cardBody);

    var parent = document.getElementById(parentname);
    parent.appendChild(card);
}

function addFriend(el) {
    var username = document.cookie
        .split('; ')
        .find(row => row.startsWith('username'));
    if (username != undefined) {
        username = username.split('=')[1];
    } else {
        window.location.replace("../");
    }

    $.ajax({
        type: "POST",
        url: "../api/sendRequest.php",
        data: {
            "sentFrom": username,
            "sentTo": (el.id).slice(4),
        },
        contentType: "application/x-www-form-urlencoded",
        success: function(responseData, textStatus, jqXHR) {
            if (responseData.status == true) {
                el.removeAttribute("onclick");
                el.innerText = "Sent!";
                el.classList.remove("btn-primary");
                el.classList.add("btn-success");
                setTimeout(function() {
                    el.parentNode.parentNode.parentNode.removeChild(el.parentNode.parentNode);
                }, 1500);
                var temp = document.getElementById('allUserList');
                noPosts = document.createElement("div");
                noPosts.innerText = "No new users on platform!";
                noPosts.classList.add("card", "card-body");
                temp.appendChild(noPosts);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
}

function acceptRequest(el) {
    var username = document.cookie
        .split('; ')
        .find(row => row.startsWith('username'));
    if (username != undefined) {
        username = username.split('=')[1];
    } else {
        window.location.replace("../");
    }

    $.ajax({
        type: "POST",
        url: "../api/acceptRequest.php",
        data: {
            "sentFrom": (el.id).slice(7),
            "sentTo": username,
        },
        contentType: "application/x-www-form-urlencoded",
        success: function(responseData, textStatus, jqXHR) {
            if (responseData.status == true) {
                el.removeAttribute("onclick");
                el.innerText = "Accepted!";
                el.classList.remove("btn-primary");
                el.classList.add("btn-success");
                setTimeout(function() {
                    el.parentNode.parentNode.parentNode.parentNode.removeChild(el.parentNode.parentNode.parentNode);
                    var temp = document.getElementById('requestList');
                    child = temp.children;
                    noOfPosts = temp.childElementCount;
                    if (!noOfPosts) {
                        noPosts = document.createElement("div");
                        noPosts.innerText = "Try adding more friends or ask your friends to post!";
                        noPosts.classList.add("card", "card-body", "mb-3");
                        temp.appendChild(noPosts);
                    }
                }, 1500);

            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
}


function rejectRequest(el) {
    var username = document.cookie
        .split('; ')
        .find(row => row.startsWith('username'));
    if (username != undefined) {
        username = username.split('=')[1];
    } else {
        window.location.replace("../");
    }

    $.ajax({
        type: "POST",
        url: "../api/rejectRequest.php",
        data: {
            "sentFrom": (el.id).slice(7),
            "sentTo": username,
        },
        contentType: "application/x-www-form-urlencoded",
        success: function(responseData, textStatus, jqXHR) {
            if (responseData.status == true) {
                el.removeAttribute("onclick");
                el.innerText = "Rejected!";
                el.classList.remove("btn-primary");
                el.classList.add("btn-success");
                setTimeout(function() {
                    el.parentNode.parentNode.parentNode.parentNode.removeChild(el.parentNode.parentNode.parentNode);
                    var temp = document.getElementById('requestList');
                    noPosts = document.createElement("div");
                    noPosts.innerText = "No Pending Friend requests";
                    noPosts.classList.add("card", "card-body");
                    temp.appendChild(noPosts);
                }, 1500);

            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })

}