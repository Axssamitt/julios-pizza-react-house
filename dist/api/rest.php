<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$table = $_GET['table'] ?? '';
$input = json_decode(file_get_contents('php://input'), true);

if (!$table) {
    http_response_code(400);
    echo json_encode(['error' => 'Tabela não especificada']);
    exit;
}

// Sanitização básica para nomes de colunas
function sanitizeCol($col) {
    return preg_replace('/[^a-zA-Z0-9_]/', '', $col);
}

// Filtros básicos estilo PostgREST
function buildWhere($pdo) {
    $where = [];
    $params = [];
    foreach ($_GET as $key => $value) {
        if (in_array($key, ['table', 'select', 'order', 'limit'])) continue;

        $key = sanitizeCol($key);
        $parts = explode('.', $value, 2);
        if (count($parts) < 2) continue;

        $op = $parts[0];
        $val = $parts[1];

        switch ($op) {
            case 'eq': $where[] = "`$key` = ?"; $params[] = $val; break;
            case 'neq': $where[] = "`$key` != ?"; $params[] = $val; break;
            case 'gt': $where[] = "`$key` > ?"; $params[] = $val; break;
            case 'gte': $where[] = "`$key` >= ?"; $params[] = $val; break;
            case 'lt': $where[] = "`$key` < ?"; $params[] = $val; break;
            case 'lte': $where[] = "`$key` <= ?"; $params[] = $val; break;
            case 'like': $where[] = "`$key` LIKE ?"; $params[] = str_replace('*', '%', $val); break;
            case 'ilike': $where[] = "LOWER(`$key`) LIKE LOWER(?)"; $params[] = str_replace('*', '%', $val); break;
            case 'is':
                if ($val === 'null') $where[] = "`$key` IS NULL";
                else $where[] = "`$key` = ?"; $params[] = $val;
                break;
            case 'in':
                $vals = explode(',', trim($val, '()'));
                $placeholders = implode(',', array_fill(0, count($vals), '?'));
                $where[] = "`$key` IN ($placeholders)";
                $params = array_merge($params, $vals);
                break;
        }
    }
    return [$where ? "WHERE " . implode(" AND ", $where) : "", $params];
}

switch ($method) {
    case 'GET':
        [$where, $params] = buildWhere($pdo);
        $select = $_GET['select'] ?? '*';
        // Simples validação para select
        if ($select !== '*' && !preg_match('/^[a-zA-Z0-9_, ]+$/', $select)) {
             $select = '*';
        }

        $order = '';
        if (isset($_GET['order'])) {
            $orderParts = explode(',', $_GET['order']);
            $orders = [];
            foreach ($orderParts as $o) {
                $p = explode('.', $o);
                $col = sanitizeCol($p[0]);
                $dir = strtoupper($p[1] ?? 'ASC');
                if (!in_array($dir, ['ASC', 'DESC'])) $dir = 'ASC';
                $orders[] = "`$col` $dir";
            }
            $order = "ORDER BY " . implode(', ', $orders);
        }
        $limit = isset($_GET['limit']) ? "LIMIT " . (int)$_GET['limit'] : "";

        $sql = "SELECT $select FROM `$table` $where $order $limit";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        // Se o frontend não enviou ID (UUID), nós geramos um
        if (!isset($input['id'])) {
            $stmtId = $pdo->query("SELECT UUID() as uuid");
            $rowId = $stmtId->fetch();
            $input['id'] = $rowId['uuid'];
        }

        $cols = array_keys($input);
        $sanitizedCols = array_map('sanitizeCol', $cols);
        $placeholders = implode(',', array_fill(0, count($cols), '?'));

        $sql = "INSERT INTO `$table` (`" . implode("`,`", $sanitizedCols) . "`) VALUES ($placeholders)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(array_values($input));

        // Retorna o objeto inserido buscando pelo ID enviado ou gerado
        $stmt = $pdo->prepare("SELECT * FROM `$table` WHERE id = ?");
        $stmt->execute([$input['id']]);
        echo json_encode($stmt->fetch());
        break;

    case 'PATCH':
        [$where, $params] = buildWhere($pdo);
        if (!$where) {
            http_response_code(400);
            echo json_encode(['error' => 'Filtro (ID) obrigatório para update']);
            exit;
        }
        $sets = [];
        $updateParams = [];
        foreach ($input as $col => $val) {
            $col = sanitizeCol($col);
            $sets[] = "`$col` = ?";
            $updateParams[] = $val;
        }
        $sql = "UPDATE `$table` SET " . implode(', ', $sets) . " $where";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(array_merge($updateParams, $params));
        echo json_encode(['success' => true]);
        break;

    case 'DELETE':
        [$where, $params] = buildWhere($pdo);
        if (!$where) {
            http_response_code(400);
            echo json_encode(['error' => 'Filtro (ID) obrigatório para delete']);
            exit;
        }
        $sql = "DELETE FROM `$table` $where";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        echo json_encode(['success' => true]);
        break;
}
