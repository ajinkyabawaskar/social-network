<?php
/* This is the authentication API which is used to handle log in and sign up */

// API to work only on POST method, so unauthorising rest of the methods
switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        $auth = authenticateUser();
        response($auth);
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

function authenticateUser()
{
    $inputError = array();

    // validate for empty or invalid inputs
    if (empty($_POST['username'])) {
        array_push($inputError, "Empty username not allowed!");
    }
    if (empty($_POST['password'])) {
        array_push($inputError, "Empty password not allowed!");
    }
    $validIntents = ["logIn", "signUp"];
    if ((!isset($_POST['intent'])) or (!in_array($_POST['intent'], $validIntents))) {
        array_push($inputError, "Invalid intent");
    }

    /* checking if dataError array is empty,
        i.e there are no errors with POST input data,
        proceeding with authentication */

    if ($inputError == array()) {
        if ($_POST['intent'] == "logIn") {
            $response = doLogIn();
        }
        if ($_POST['intent'] == "signUp") {
            $response = doSignUp();
        }
        return $response;
    }
    // return the encountered errors
    else {
        $inputError['message'] = implode(", ", $inputError);
        $inputError['status'] = false;
        return $inputError;
    }
}

function doLogIn()
{
    $config = parse_ini_file('../database/db_config.ini');
    try {
        // establish a new database connection
        $connection = new PDO('mysql:host=' . $config["server"] . ';dbname=' . $config["database"], $config["username"], $config["password"]);
        $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // prepare the statement, bind params and execute the query
        $logInQuery = $connection->prepare("SELECT * FROM accounts WHERE username = :username");
        $logInQuery->bindParam(':username', $_POST['username']);
        $logInQuery->execute();
        $result = $logInQuery->setFetchMode(PDO::FETCH_ASSOC);
        $result = $logInQuery->fetch();

        // reset the connection
        $connection = null;

        if ($result == false) {
            return array(
                "status" => false,
                "message" => "Account does not exist!"
            );
        } else {
            $passwordVerified = password_verify($_POST['password'], $result['password']);
            if ($passwordVerified) {
                // setCookie to validate the session on client side, expires after one day
                setcookie("sessionSecret", generateRandomString(100), time() + (86400), "/", isset($_SERVER["HTTPS"]));
                return array(
                    "status" => true,
                    "message" => "Password Matches!",
                );
            } else {
                return array(
                    "status" => false,
                    "message" => "Incorrect Password!"
                );
            }
        }
    } catch (PDOException $e) {
        return array(
            "status" => false,
            "message" => "PDO Error: ".$e->getMessage()
        );
        die();
    }
}

function doSignUp()
{
    $config = parse_ini_file('../database/db_config.ini');
    try {
        // establish PDO connection
        $connection = new PDO('mysql:host=' . $config["server"] . ';dbname=' . $config["database"], $config["username"], $config["password"]);
        $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // check if account already exists

        // prepare the statement, bind params and execute the query
        $logInQuery = $connection->prepare("SELECT * FROM accounts WHERE username = :username");
        $logInQuery->bindParam(':username', $_POST['username']);
        $logInQuery->execute();
        $getAccount = $logInQuery->setFetchMode(PDO::FETCH_ASSOC);
        $getAccount = $logInQuery->fetch();

        // account does not exist, proceed with signup
        if ($getAccount == false) {
            // prepare the statement
            $signUpQuery = $connection->prepare("INSERT INTO accounts (username, password) VALUES (:username, :password)");
            // bind the parameters
            $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
            $signUpQuery->bindParam(':username', $_POST['username']);
            $signUpQuery->bindParam(':password', $password);
            // execute the query
            $signUpQuery->execute();

            if ($signUpQuery == false) {
                return array(
                    "status" => false,
                    "message" => "Account could not be created - Internal Server Error"
                );
            } else {
                return array(
                    "status" => true,
                    "message" => "Account created successfully."
                );
            }
        }
        // account exists when trying to sign up
        else {
            return array(
                "status" => false,
                "message" => "Account already exists."
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
function generateRandomString($length) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}