$(document).ready(function() {
    document.cookie = "sessionSecret=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    $("#inputPassword").keyup(function() {
        inputPassword = $("#inputPassword").val();
    });

    $("#inputUsername").keyup(function() {
        inputUsername = $("#inputUsername").val();
        // $.ajax({
        //     type: "get",
        //     url: "api/usernameAvailability.php",
        //     data: {
        //         "username": inputUsername,
        //     },
        //     contentType: "application/x-www-form-urlencoded",
        //     success: function(responseData, textStatus, jqXHR) {
        //         console.log(responseData);
        //         if (responseData.status) {
        //             // handle successful auths
        //             // $("#usernameHelp").text(responseData.message);
        //             $("#usernameHelp").hide();
        //         } else {
        //             // handle unsuccessful auths
        //             $("#usernameHelp").text(responseData.message);
        //             $("#usernameHelp").show();
        //         }
        //     },
        //     error: function(jqXHR, textStatus, errorThrown) {
        //         $("#usernameHelp").text(JSON.stringify(errorThrown));
        //     }
        // })
    });

    $("#logIn").click(function() {
        intent = "logIn";
    });

    $("#signUp").click(function() {
        intent = "signUp";
    });

    /* attach a submit handler to the form */
    $("#authForm").submit(function(formSubmitEvent) {
        /* stop form from submitting normally */
        formSubmitEvent.preventDefault();
        /* get values from elements on the page: */
        var $form = $(this),
            inputUsername = $form.find('input[name="username"]').val(),
            inputPassword = $form.find('input[name="password"]').val(),
            url = $form.attr('action');
        postData = [inputUsername, inputPassword];
        $.ajax({
            type: "post",
            url: url,
            data: {
                "username": inputUsername,
                "password": inputPassword,
                "intent": intent
            },
            contentType: "application/x-www-form-urlencoded",
            success: function(responseData, textStatus, jqXHR) {
                if (responseData.status) {
                    // handle successful auths
                    var sessionSecret = document.cookie
                        .split('; ')
                        .find(row => row.startsWith('sessionSecret'))
                    if (sessionSecret != undefined) {
                        sessionSecret = sessionSecret.split('=')[1];
                    }
                    if (sessionSecret) {
                        document.cookie = "username=" + inputUsername;
                        window.location.replace("feed/");
                    } else {
                        $("#usernameHelp").removeClass("text-danger");
                        $("#usernameHelp").addClass("text-success");
                        $("#usernameHelp").text(responseData.message);
                    }
                } else {
                    // handle unsuccessful auths
                    $("#usernameHelp").text(responseData.message);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $("#usernameHelp").text(JSON.stringify(errorThrown));
            }
        })
    })
});