<?php

$received_data = json_decode(file_get_contents('php://input'));
if ($received_data->action == 'fetchall') {
    echo json_encode('bla');
}