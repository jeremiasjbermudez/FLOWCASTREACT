<?php
// db connection
$conn = new mysqli('localhost','admin','ti@A4pnc','PNCaccounts');
if($conn->connect_error) die($conn->connect_error);

$billName = $conn->real_escape_string($_POST['Bill']);
$amount   = floatval($_POST['Amount']);
$contains = $conn->real_escape_string($_POST['ContainsText']);
$account  = $conn->real_escape_string($_POST['Account']);

$recurrence = $_POST['recurrence'];
$start      = new DateTime($_POST['start_date']);
$end        = new DateTime($_POST['end_date']);
$end->modify('+1 day'); // make end inclusive

$datesToInsert = [];

if ($recurrence === 'once') {
    // single date
    $datesToInsert[] = new DateTime($_POST['dates'][0]);
}
elseif ($recurrence === 'monthly') {
    $day = intval($_POST['dayOfMonth']);
    $interval = new DateInterval('P1M');
    $period   = new DatePeriod($start, $interval, $end);
    foreach ($period as $dt) {
        // adjust each to the requested day-of-month
        $dt->setDate($dt->format('Y'), $dt->format('m'), $day);
        if ($dt >= $start && $dt < $end) {
            $datesToInsert[] = clone $dt;
        }
    }
}
elseif ($recurrence === 'weekly') {
    $dowMap = ['MO'=>1,'TU'=>2,'WE'=>3,'TH'=>4,'FR'=>5,'SA'=>6,'SU'=>7];
    $selected = $_POST['weekdays']; // e.g. ['MO','WE','FR']
    $interval = new DateInterval('P1D');
    $period   = new DatePeriod($start, $interval, $end);
    foreach ($period as $dt) {
        $w = intval($dt->format('N')); // 1=Mon … 7=Sun
        foreach ($selected as $code) {
            if ($dowMap[$code] === $w) {
                $datesToInsert[] = clone $dt;
            }
        }
    }
}

// now insert
$stmt = $conn->prepare(
  "INSERT INTO bills (Bill, DayOfMonth, Amount, ContainsText, Account)
   VALUES (?, ?, ?, ?, ?)"
);
foreach ($datesToInsert as $d) {
    $stmt->bind_param(
      'sddss',
      $billName,
      $d->format('Y-m-d'),
      $amount,
      $contains,
      $account
    );
    $stmt->execute();
}

$stmt->close();
$conn->close();

header("Location: future_projection.php?msg=" . urlencode("Inserted " . count($datesToInsert) . " entries"));
exit;
