<?php
/* This is the authentication API which is used to handle log in and sign up */

// API to work only on POST method, so unauthorising rest of the methods
switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        $postStatus = addPost();
        response($postStatus);
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

function addPost()
{
    $config = parse_ini_file('../database/config.ini');
    try {
        // establish PDO connection
        $connection = new PDO('mysql:host=' . $config["server"] . ';dbname=' . $config["database"], $config["username"], $config["password"]);
        $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // prepare the statement
        $signUpQuery = $connection->prepare("INSERT INTO posts (author, tweet) VALUES (:author, :tweet)");
        // bind the parameters
        $signUpQuery->bindParam(':author', $_POST['author']);
        $signUpQuery->bindParam(':tweet', $_POST['tweet']);
        // execute the query
        $signUpQuery->execute();

        if ($signUpQuery == false) {
            return array(
                "status" => false,
                "message" => "Post could not be published - Internal Server Error"
            );
        } else {
            return array(
                "status" => true,
                "message" => "Post published successfully.",
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

