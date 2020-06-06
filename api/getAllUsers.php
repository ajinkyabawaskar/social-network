<?php
/* This API is used to get all (Max. 20) users of the platform */

// API to work only on POST method, so unauthorising rest of the methods
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $allUsers = getAllUsers();
        response($allUsers);
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

function getAllUsers()
{
    $config = parse_ini_file('../database/db_config.ini');
    try {
        // establish PDO connection
        $connection = new PDO('mysql:host=' . $config["server"] . ';dbname=' . $config["database"], $config["username"], $config["password"]);
        $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // prepare the statement
        $getAllUsers = $connection->prepare("SELECT username FROM accounts LIMIT 20;");
        // execute the query
        $getAllUsers->execute();
        $allUsers = $getAllUsers->setFetchMode(PDO::FETCH_ASSOC);
        $allUsers = $getAllUsers->fetchAll();

        if ($allUsers == array()) {
            return array(
                "status" => true,
                "message" => "No users on platform!"
            );
        }
        return $allUsers;
    } catch (PDOException $e) {
        return array(
            "status" => false,
            "message" => $e->getMessage()
        );
        die();
    }
}
