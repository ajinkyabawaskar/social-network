$(document).ready(function() {


    var sessionSecret = document.cookie
        .split('; ')
        .find(row => row.startsWith('sessionSecret'));
    if (sessionSecret != undefined) {
        sessionSecret = sessionSecret.split('=')[1];
    }
    if (sessionSecret === undefined)
        window.location.replace("../");


    var username = document.cookie
        .split('; ')
        .find(row => row.startsWith('username'));
    if (username != undefined) {
        username = username.split('=')[1];
    } else {
        window.location.replace("../");
    }

    $("#username").text(username);



    $("#logoutButton").click(function() {
        document.cookie = "sessionSecret=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.replace("../");
    })

    $("#exampleFormControlTextarea1").keyup(function() {
        tweet = $("#exampleFormControlTextarea1").val();
        $("#charsLeft").text(200 - tweet.length);
        if (tweet.length < 150) {
            $("#charsLeft").parent().removeClass("text-danger");
            $("#charsLeft").parent().removeClass("text-warning");
        }
        if (200 - tweet.length < 50) {
            $("#charsLeft").parent().addClass("text-warning");
        }
        if (200 - tweet.length < 25) {
            $("#charsLeft").parent().addClass("text-danger");
        }
        if (tweet.length >= 201) {
            $("#charsLeft").text(0);
            tweet = tweet.substring(0, 200);
            $("#exampleFormControlTextarea1").val(tweet);
        }
    });

    $("#goToFriends").click(function() {
        window.location.replace("../friends/");
    })

    /* attach a submit handler to the form */
    $("#publishPost").submit(function(formSubmitEvent) {
        $("#tweetCharsLeft").text("Publishing...");
        /* stop form from submitting normally */
        formSubmitEvent.preventDefault();

        $.ajax({
            type: "post",
            url: "../api/addPost.php",
            data: {
                "author": username,
                "tweet": tweet,
            },
            contentType: "application/x-www-form-urlencoded",
            success: function(responseData, textStatus, jqXHR) {
                if (responseData.status) {
                    // handle successful auths
                    $("#charsLeft").parent().addClass("text-success");
                    $("#charsLeft").parent().removeClass("text-danger");
                    $("#charsLeft").parent().removeClass("text-warning");
                    $("#tweetCharsLeft").addClass("text-success");
                    $("#tweetCharsLeft").text(responseData.message);
                } else {
                    // handle unsuccessful auths
                    $("#tweetCharsLeft").text(responseData.message);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $("#tweetCharsLeft").text(JSON.stringify(errorThrown));
            }
        })
    })

    $.ajax({
        type: "get",
        url: "../api/getPosts.php",
        data: {
            "friendsOf": username,
        },
        contentType: "application/x-www-form-urlencoded",
        success: function(responseData, textStatus, jqXHR) {


            for (i = 0; i < responseData.length; i++) {
                putPostsDataToDOM(responseData[i], "feedOfPosts");
            }
            var temp = document.getElementById('feedOfPosts');
            child = temp.children;
            noOfPosts = temp.childElementCount;
            if (!noOfPosts) {
                noPosts = document.createElement("div");
                noPosts.innerText = "Try adding more friends or ask your friends to post!";
                noPosts.classList.add("card", "card-body", "mb-3");
                temp.appendChild(noPosts);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log((jqXHR.responseText));
        }
    })


})

function putPostsDataToDOM(singleCard, parentName) {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    var card = document.createElement("div");
    card.classList.add("card", "shadow-sm", "mb-3");
    var cardBody = document.createElement("div");
    cardBody.classList.add("card-body");
    var cardTitle = document.createElement("div");
    cardTitle.innerText = singleCard.author;
    cardTitle.classList.add("card-title");
    var cardSubTitle = document.createElement("div");
    var a = new Date(); // Current date now.
    var b = new Date(singleCard['posted']);
    var d = Math.abs(b - a);
    if (d / 1000 < 60)
        singleCard.posted = ((d / 1000).toFixed(0) + " seconds ago");
    else if (d / 60000 < 60)
        singleCard.posted = ((d / 60000).toFixed(0) + " minutes ago");
    else if (d / 1440000 < 24)
        singleCard.posted = ((d / 1440000).toFixed(0) + " hours ago");
    else if (a.getUTCFullYear() - b.getUTCFullYear() < 1)
        singleCard.posted = b.getDate() + " " + monthNames[b.getMonth()];
    else singleCard.posted = monthNames[b.getMonth()] + " " + b.getUTCFullYear();

    cardSubTitle.innerText = singleCard.posted;
    cardSubTitle.classList.add("card-subtitle", "mb-2", "text-muted");
    var cardText = document.createElement("p");
    cardText.innerText = singleCard.tweet;
    cardText.classList.add("card-text");


    cardBody.appendChild(cardText);
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardSubTitle);
    card.appendChild(cardBody);
    var parent = document.getElementById(parentName);
    parent.appendChild(card);
}