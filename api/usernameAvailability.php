<?php
/* This is the authentication API which is used to handle log in and sign up */

// API to work only on POST method, so unauthorising rest of the methods
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $availability = getAvailability();
        response($availability);
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

function getAvailability()
{
    if (!empty($_GET['username'])) {
        $config = parse_ini_file('../database/config.ini');
        try {
            // establish a new database connection
            $connection = new PDO('mysql:host=' . $config["server"] . ';dbname=' . $config["database"], $config["username"], $config["password"]);
            $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // prepare the statement, bind params and execute the query
            $logInQuery = $connection->prepare("SELECT * FROM accounts WHERE username = :username");
            $logInQuery->bindParam(':username', $_GET['username']);
            $logInQuery->execute();
            $result = $logInQuery->setFetchMode(PDO::FETCH_ASSOC);
            $result = $logInQuery->fetchAll();

            // reset the connection
            $connection = null;

            if ($result == array()) {
                return array(
                    "status" => true,
                    "message" => "Username Available"
                );
            } else {
                return array(
                    "status" => false,
                    "message" => "Username not available"
                );
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
            "message" => "Empty Parameters"
        );
    }
}
