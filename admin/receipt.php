<?php
require_once '../includes/db.php';

if (!isset($_GET['id'])) {
    die("Keine ID angegeben.");
}

$stmt = $pdo->prepare("SELECT * FROM cash_register WHERE id = ?");
$stmt->execute([$_GET['id']]);
$t = $stmt->fetch();

if (!$t) {
    die("Eintrag nicht gefunden.");
}

// Calculate Tax
$net = $t['amount'] / (1 + ($t['tax_rate'] / 100));
$tax = $t['amount'] - $net;
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Beleg <?php echo $t['receipt_number']; ?></title>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace;
            background: #eee;
            display: flex;
            justify-content: center;
            padding: 2rem;
        }
        .receipt {
            background: white;
            width: 300px; /* Thermal printer width approx */
            padding: 20px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
        }
        .header h2 { margin: 0; font-size: 1.2rem; }
        .header p { margin: 5px 0; font-size: 0.8rem; }
        .details {
            margin-bottom: 20px;
            font-size: 0.9rem;
        }
        .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        .total-row {
            border-top: 1px dashed #000;
            margin-top: 10px;
            padding-top: 10px;
            font-weight: bold;
            font-size: 1.1rem;
        }
        .footer {
            text-align: center;
            font-size: 0.7rem;
            margin-top: 20px;
            border-top: 1px dashed #000;
            padding-top: 10px;
        }
        @media print {
            body { background: white; padding: 0; }
            .receipt { width: 100%; box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h2>RENT-EX</h2>
            <p>Vermietung & Transport</p>
            <p>rentex.metechnik.at</p>
            <p>UID: ATU12345678</p>
        </div>
        
        <div class="details">
            <div class="row">
                <span>Beleg-Nr:</span>
                <span><?php echo $t['receipt_number']; ?></span>
            </div>
            <div class="row">
                <span>Datum:</span>
                <span><?php echo date('d.m.Y H:i', strtotime($t['created_at'])); ?></span>
            </div>
            <div class="row">
                <span>Kassierer:</span>
                <span><?php echo htmlspecialchars($t['created_by']); ?></span>
            </div>
        </div>

        <div style="margin-bottom: 15px; font-weight: bold;">
            <?php echo htmlspecialchars($t['description']); ?>
        </div>

        <div class="row">
            <span>Betrag Netto</span>
            <span><?php echo number_format($net, 2, ',', '.'); ?></span>
        </div>
        <div class="row">
            <span>+ <?php echo $t['tax_rate']; ?>% USt.</span>
            <span><?php echo number_format($tax, 2, ',', '.'); ?></span>
        </div>
        
        <div class="row total-row">
            <span>GESAMT EUR</span>
            <span><?php echo number_format($t['amount'], 2, ',', '.'); ?></span>
        </div>

        <div class="row" style="margin-top: 5px; font-size: 0.8rem;">
            <span>Zahlart:</span>
            <span><?php echo ucfirst($t['payment_method']); ?></span>
        </div>

        <div class="footer">
            <p>Vielen Dank für Ihren Besuch!</p>
            <p>Es gelten unsere AGB.</p>
            <p>Sicherheitscode: <?php echo substr(md5($t['id'] . $t['created_at']), 0, 8); ?>-...</p>
        </div>
    </div>
    <script>
        window.onload = function() { window.print(); }
    </script>
</body>
</html>
