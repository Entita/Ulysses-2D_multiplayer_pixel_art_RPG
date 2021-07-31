<?php
$conn = mysqli_connect("sql2.webzdarma.cz", "pouzekvalitn6487", "zrTEaBU", "pouzekvalitn6487");
mysqli_query($conn, "SET NAMES cp1250");
if (mysqli_connect_errno($conn)) {
    echo "Nelze se pripojit k DB-serveru!";
    exit;
}

$received_data = json_decode(file_get_contents('php://input'));
$data = array();

if ($received_data->action == 'fetchall') {
    $query = "SELECT * FROM game_messages";
    $statement = $conn->prepare($query);
    while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
        $data[] = $row;
    }
    echo json_encode($data);
}
