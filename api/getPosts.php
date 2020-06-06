<?php
/* This is the authentication API which is used to handle log in and sign up */

// API to work only on POST method, so unauthorising rest of the methods
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $posts = getPosts();
        response($posts);
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

function getPosts()
{
    if (!empty($_GET['friendsOf'])) {
        $config = parse_ini_file('../database/db_config.ini');
        try {
            // establish PDO connection
            $connection = new PDO('mysql:host=' . $config["server"] . ';dbname=' . $config["database"], $config["username"], $config["password"]);
            $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            // prepare the statement
            $getFriendsOf = $connection->prepare("SELECT member1, member2 FROM friendships WHERE :friendsOf IN (member1, member2);");
            $getFriendsOf->bindParam(':friendsOf', $_GET['friendsOf']);
            // execute the query
            $getFriendsOf->execute();
            $friendsOf = $getFriendsOf->setFetchMode(PDO::FETCH_ASSOC);
            $friendsOf = $getFriendsOf->fetchAll();

            $authors = array();

            for ($i = 0; $i < count($friendsOf); $i++) {
                if (!in_array($friendsOf[$i]['member1'], $authors) and $friendsOf[$i]['member1'] != $_GET['friendsOf']) {
                    array_push($authors, $friendsOf[$i]['member1']);
                }
                if (!in_array($friendsOf[$i]['member2'], $authors) and $friendsOf[$i]['member2'] != $_GET['friendsOf']) {
                    array_push($authors, $friendsOf[$i]['member2']);
                }
            }
            if ($authors == array()) {
                return array(
                    "status" => true,
                    "message" => "No friends, no posts!"
                );
            } else {
                $postsFromAllAuthors = array();
                // prepare the statement
                $getPostsOf = $connection->prepare("SELECT * FROM posts WHERE author = :author ORDER BY posted DESC");

                for ($i = 0; $i < count($authors); $i++) {
                    $getPostsOf->bindParam(':author', $authors[$i]);
                    // execute the query
                    $getPostsOf->execute();
                    $postsFromOneAuthor = $getPostsOf->setFetchMode(PDO::FETCH_ASSOC);
                    $postsFromOneAuthor = $getPostsOf->fetchAll();

                    if ($postsFromOneAuthor != array()) {
                        for ($j = 0; $j < count($postsFromOneAuthor); $j++) {
                            if (!in_array($postsFromOneAuthor[$j], $postsFromAllAuthors))
                                array_push($postsFromAllAuthors, $postsFromOneAuthor[$j]);
                        }
                    }
                    if (count($postsFromAllAuthors) > 19) {
                        break;
                    } else {
                        continue;
                    }
                }
                foreach ($postsFromAllAuthors as $key => $part) {
                    $sort[$key] = strtotime($part['posted']);
                }
                @array_multisort($sort, SORT_DESC, $postsFromAllAuthors);

                return $postsFromAllAuthors;
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
