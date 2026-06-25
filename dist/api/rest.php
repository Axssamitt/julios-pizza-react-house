<?php
require_once 'db.php';

$table = $_GET['table'] ?? '';
if (!$table || !in_array($table, $allowed_tables)) {
    http_response_code(403);
    echo json_encode(['error' => 'Table not allowed or not specified']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Public tables that can be read without authentication
$public_tables = ['carousel_images', 'home_config', 'instagram_posts', 'pizzas'];

if ($method !== 'GET' || !in_array($table, $public_tables)) {
    if (!verifyToken()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

switch ($method) {
    case 'GET':
        $id = $_GET['id'] ?? null;
        $select = '*'; // Simplified for security, we don't allow arbitrary select

        $where = [];
        $params = [];
        foreach ($_GET as $key => $value) {
            if (!in_array($key, ['table', 'id', 'select', 'order', 'limit', 'offset'])) {
                // Only allow filtering by alphanumeric keys to prevent injection
                if (preg_match('/^[a-zA-Z0-9_]+$/', $key)) {
                    $where[] = "$key = ?";
                    $params[] = $value;
                }
            }
        }

        if ($id) {
            $where[] = "id = ?";
            $params[] = $id;
        }

        $sql = "SELECT $select FROM `$table`";
        if (!empty($where)) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }

        if (isset($_GET['order'])) {
            // Very basic sanitation for order by
            $order = $_GET['order'];
            if (preg_match('/^[a-zA-Z0-9_ ]+$/', $order)) {
                $sql .= " ORDER BY $order";
            }
        }

        if (isset($_GET['limit'])) {
            $sql .= " LIMIT " . (int)$_GET['limit'];
        }

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetchAll();

        if ($id && count($result) === 1) {
            echo json_encode($result[0]);
        } else {
            echo json_encode($result);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['id'])) {
            $data['id'] = generateUUID();
        }

        $keys = array_keys($data);
        $safe_keys = array_filter($keys, function($k) { return preg_match('/^[a-zA-Z0-9_]+$/', $k); });
        $fields = implode(', ', array_map(function($k) { return "`$k`"; }, $safe_keys));
        $placeholders = implode(', ', array_fill(0, count($safe_keys), '?'));

        $sql = "INSERT INTO `$table` ($fields) VALUES ($placeholders)";
        $stmt = $pdo->prepare($sql);
        try {
            $values = [];
            foreach ($safe_keys as $key) {
                $values[] = $data[$key];
            }
            $stmt->execute($values);
            echo json_encode(['id' => $data['id'], 'success' => true]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['error' => 'Database error']);
        }
        break;

    case 'PUT':
    case 'PATCH':
        $id = $_GET['id'] ?? null;
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$id && isset($data['id'])) {
            $id = $data['id'];
            unset($data['id']);
        }

        if (!$id) {
            echo json_encode(['error' => 'ID not specified']);
            exit;
        }

        $fields = [];
        $params = [];
        foreach ($data as $key => $value) {
            if (preg_match('/^[a-zA-Z0-9_]+$/', $key)) {
                $fields[] = "`$key` = ?";
                $params[] = $value;
            }
        }
        $params[] = $id;

        $sql = "UPDATE `$table` SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['success' => true]);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            echo json_encode(['error' => 'ID not specified']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM `$table` WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        break;
}
?>
