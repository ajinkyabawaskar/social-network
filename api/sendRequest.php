<?php
/* This is the authentication API which is used to handle log in and sign up */

// API to work only on POST method, so unauthorising rest of the methods
switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        $requests = addFriend();
        response($requests);
        break;
    default:
        header("HTTP/1.0 401 Unauthorized");
        break;
}
// An utility function to return JSON data with appropriate headers
function response($response_data)
{
    header('Content-Type: application/json');
    echo json_encode($response_data);
}

function addFriend()
{
    if (empty($_POST['sentTo']) or empty($_POST['sentFrom'])) {
        return array(
            "status" => false,
            "message" => "Empty parameters"
        );
    } else {
        $config = parse_ini_file('../database/config.ini');
        try {
            // establish PDO connection
            $connection = new PDO('mysql:host=' . $config["server"] . ';dbname=' . $config["database"], $config["username"], $config["password"]);
            $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // prepare the statement
            $setRequests = $connection->prepare("INSERT INTO requests (sentFrom, sentTo) VALUES (:sentFrom, :sentTo)");
            $setRequests->bindParam(':sentFrom', $_POST['sentFrom']);
            $setRequests->bindParam(':sentTo', $_POST['sentTo']);
            // execute the query
            $setRequests->execute();

            if($setRequests == true) {
                return array(
                    "status" => true,
                    "message" => "Request Sent!"
                );
            } else {
                return array(
                    "status" => false,
                    "message" => "Request not sent!"  
                );
            }
        } catch (PDOException $e) {
            return array(
                "status" => false,
                "message" => $e->getMessage()
            );
            die();
        }
    }
}
