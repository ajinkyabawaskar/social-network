<?php
/* This is the authentication API which is used to handle log in and sign up */

// API to work only on POST method, so unauthorising rest of the methods
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $friends = getFriends();
        response($friends);
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

function getFriends()
{
    if (!empty($_GET['username'])) {
        $config = parse_ini_file('../database/db_config.ini');
        try {
            // establish PDO connection
            $connection = new PDO('mysql:host=' . $config["server"] . ';dbname=' . $config["database"], $config["username"], $config["password"]);
            $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // prepare the statement
            $getFriendships = $connection->prepare("SELECT DISTINCT * FROM friendships WHERE :friendsOf IN (member1, member2) LIMIT 20;");
            // bind the parameters
            $getFriendships->bindParam(':friendsOf', $_GET["username"]);
            // execute the query
            $getFriendships->execute();
            $friendships = $getFriendships->setFetchMode(PDO::FETCH_ASSOC);
            $friendships = $getFriendships->fetchAll();

            return $friendships;
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
            "message" => "Empty Parameters"
        );
    }
}
