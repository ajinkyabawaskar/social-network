<?php
/* This is the authentication API which is used to handle log in and sign up */

// API to work only on POST method, so unauthorising rest of the methods
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $requests = getRequests();
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

function getRequests()
{
    if(!empty($_GET['sentTo'])) {
    $config = parse_ini_file('../database/db_config.ini');
    try {
        // establish PDO connection
        $connection = new PDO('mysql:host=' . $config["server"] . ';dbname=' . $config["database"], $config["username"], $config["password"]);
        $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // prepare the statement
        $getRequests = $connection->prepare("SELECT * FROM requests WHERE sentTo = :sentTo LIMIT 20;");
        $getRequests->bindParam(':sentTo', $_GET['sentTo']);
        // execute the query
        $getRequests->execute();
        $requests = $getRequests->setFetchMode(PDO::FETCH_ASSOC);
        $requests = $getRequests->fetchAll();

        if($requests == array()) {
            return array(
                "status" => true,
                "message" => "No Friend Requests!"
            );
        } else {
            return $requests;
        }

    } catch (PDOException $e) {
        return array(
            "status" => false,
            "message" => $e->getMessage()
        );
        die();
    }
} else {
    return array(
        "status" => false,
        "message" => "Empty parameters"
    );
}
}

