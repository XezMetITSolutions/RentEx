<?php
require_once 'header.php';
require_once '../includes/db.php';

// Handle Add Transaction
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['add_transaction'])) {
    $type = $_POST['type'];
    $amount = $_POST['amount'];
    $category = $_POST['category'];
    $description = $_POST['description'];
    $payment_method = $_POST['payment_method'];
    $tax_rate = $_POST['tax_rate'];
    
    $receipt_number = 'R-' . date('Ymd') . '-' . rand(1000, 9999);

    $stmt = $pdo->prepare("INSERT INTO cash_register (receipt_number, transaction_type, amount, tax_rate, category, description, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$receipt_number, $type, $amount, $tax_rate, $category, $description, $payment_method]);
    
    header("Location: pos.php");
    exit;
}

// Fetch Transactions
$filter_month = $_GET['month'] ?? date('Y-m');
$query = "SELECT * FROM cash_register WHERE DATE_FORMAT(created_at, '%Y-%m') = ? ORDER BY created_at DESC";
$stmt = $pdo->prepare($query);
$stmt->execute([$filter_month]);
$transactions = $stmt->fetchAll();

// Stats
$total_income = 0;
$total_expense = 0;

$balance_stmt = $pdo->query("SELECT 
    SUM(CASE WHEN transaction_type = 'income' AND payment_method = 'cash' THEN amount ELSE 0 END) as cash_in,
    SUM(CASE WHEN transaction_type = 'expense' AND payment_method = 'cash' THEN amount ELSE 0 END) as cash_out
    FROM cash_register");
$balance_row = $balance_stmt->fetch();
$current_cash_balance = ($balance_row['cash_in'] ?? 0) - ($balance_row['cash_out'] ?? 0);

foreach ($transactions as $t) {
    if ($t['transaction_type'] == 'income') $total_income += $t['amount'];
    if ($t['transaction_type'] == 'expense') $total_expense += $t['amount'];
}
?>

<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-content">
            <h3>Kassenstand (Bar)</h3>
            <div class="value">€ <?php echo number_format($current_cash_balance, 2, ',', '.'); ?></div>
        </div>
        <div class="stat-icon-wrap" style="background: rgba(245, 158, 11, 0.1); color: #f59e0b;">
            <i class="fas fa-wallet"></i>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-content">
            <h3>Einnahmen (Mt.)</h3>
            <div class="value" style="color: #10b981;">+€ <?php echo number_format($total_income, 2, ',', '.'); ?></div>
        </div>
        <div class="stat-icon-wrap icon-green">
            <i class="fas fa-arrow-down"></i>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-content">
            <h3>Ausgaben (Mt.)</h3>
            <div class="value" style="color: #ef4444;">-€ <?php echo number_format($total_expense, 2, ',', '.'); ?></div>
        </div>
        <div class="stat-icon-wrap icon-red">
            <i class="fas fa-arrow-up"></i>
        </div>
    </div>
</div>

<div style="display: flex; gap: 2rem; margin-bottom: 2rem; align-items: center; background: white; padding: 1.5rem; border-radius: var(--radius); box-shadow: var(--shadow);">
    <div style="flex: 1; display: flex; gap: 1rem;">
        <input type="month" value="<?php echo $filter_month; ?>" onchange="window.location.href='?month='+this.value" style="padding: 10px; border-radius: 10px; border: 1px solid var(--border); background: #f8fafc; outline: none; font-weight: 600;">
    </div>
    <button class="btn" style="background: #f1f5f9; color: #475569;" onclick="window.print()"><i class="fas fa-print"></i> Liste Drucken</button>
    <button onclick="document.getElementById('addTransactionModal').style.display='flex'" class="btn btn-primary" style="background: #f59e0b; box-shadow: 0 10px 20px rgba(245, 158, 11, 0.2);">
        <i class="fas fa-plus"></i> Neue Buchung
    </button>
</div>

<div class="table-container">
    <table class="data-table">
        <thead>
            <tr>
                <th>Beleg / Datum</th>
                <th>Typ</th>
                <th>Beschreibung</th>
                <th>Kategorie</th>
                <th>Zahlung</th>
                <th>Betrag</th>
                <th style="text-align: right;"></th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($transactions as $t): ?>
            <tr>
                <td>
                    <div style="font-family: monospace; font-weight: 700; color: var(--secondary);"><?php echo htmlspecialchars($t['receipt_number']); ?></div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);"><?php echo date('d.m.Y H:i', strtotime($t['created_at'])); ?></div>
                </td>
                <td>
                    <span class="status-pill <?php echo $t['transaction_type'] == 'income' ? 'status-active' : 'status-rented'; ?>">
                        <?php echo $t['transaction_type'] == 'income' ? 'Einnahme' : 'Ausgabe'; ?>
                    </span>
                </td>
                <td>
                    <div style="font-weight: 600;"><?php echo htmlspecialchars($t['description']); ?></div>
                </td>
                <td style="color: var(--text-muted);"><?php echo htmlspecialchars($t['category']); ?></td>
                <td>
                    <?php 
                        $icon = 'money-bill-wave';
                        if ($t['payment_method'] == 'card') $icon = 'credit-card';
                        if ($t['payment_method'] == 'transfer') $icon = 'university';
                    ?>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-<?php echo $icon; ?>" style="color: var(--text-muted);"></i>
                        <span style="font-weight: 600; font-size: 0.85rem;"><?php echo ucfirst($t['payment_method']); ?></span>
                    </div>
                </td>
                <td>
                    <div style="font-weight: 850; color: <?php echo $t['transaction_type'] == 'income' ? '#10b981' : '#ef4444'; ?>;">
                        <?php echo $t['transaction_type'] == 'income' ? '+' : '-'; ?>€<?php echo number_format($t['amount'], 2, ',', '.'); ?>
                    </div>
                </td>
                <td style="text-align: right;">
                    <a href="receipt.php?id=<?php echo $t['id']; ?>" target="_blank" class="btn" style="background: #f1f5f9; color: #475569; padding: 10px;"><i class="fas fa-print"></i></a>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>

<!-- Modal remains same structure but improved styling -->
<div id="addTransactionModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index:2000; align-items: center; justify-content: center;">
    <div style="background:white; width:500px; padding:3rem; border-radius:30px; box-shadow: 0 30px 60px rgba(0,0,0,0.2);">
        <h2 style="margin-bottom:2rem; font-weight: 800; letter-spacing: -1px;">Neue Buchung</h2>
        <form method="POST">
            <div style="margin-bottom:1.5rem;">
                <label style="display: block; margin-bottom: 0.8rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Typ</label>
                <div style="display:flex; gap:1rem;">
                    <label style="flex:1; cursor:pointer; border:2px solid #f0f0f0; padding:15px; border-radius:15px; text-align:center; transition: all 0.3s;" id="incomeLabel">
                        <input type="radio" name="type" value="income" checked onclick="updateCategories('income')" style="display: none;"> <i class="fas fa-plus-circle"></i> Einnahme
                    </label>
                    <label style="flex:1; cursor:pointer; border:2px solid #f0f0f0; padding:15px; border-radius:15px; text-align:center; transition: all 0.3s;" id="expenseLabel">
                        <input type="radio" name="type" value="expense" onclick="updateCategories('expense')" style="display: none;"> <i class="fas fa-minus-circle"></i> Ausgabe
                    </label>
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem; margin-bottom: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Betrag (€)</label>
                    <input type="number" step="0.01" name="amount" required style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Steuer (%)</label>
                    <select name="tax_rate" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                        <option value="20">20% (Normal)</option>
                        <option value="10">10% (Ermäßigt)</option>
                        <option value="0">0% (Frei)</option>
                    </select>
                </div>
            </div>

            <div style="margin-bottom:1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Kategorie</label>
                <select name="category" id="categorySelect" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                </select>
            </div>

            <div style="margin-bottom:1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Zahlungsart</label>
                <select name="payment_method" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                    <option value="cash">Barzahlung</option>
                    <option value="card">Kartenzahlung</option>
                    <option value="transfer">Überweisung</option>
                </select>
            </div>

            <div style="margin-bottom:2rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: var(--primary); text-transform: uppercase;">Beschreibung</label>
                <input type="text" name="description" required placeholder="z.B. Miete für Audi RS7" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
            </div>

            <div style="display:flex; justify-content:flex-end; gap:1rem;">
                <button type="button" onclick="document.getElementById('addTransactionModal').style.display='none'" class="btn" style="background: #f1f5f9; color: #475569;">Abbrechen</button>
                <button type="submit" name="add_transaction" class="btn btn-primary" style="background: #f59e0b;">Buchen</button>
            </div>
        </form>
    </div>
</div>

<script>
    const incomeCategories = ['Mieteinnahme', 'Kaution', 'Zusatzleistung', 'Verkauf', 'Sonstiges'];
    const expenseCategories = ['Tanken', 'Wartung/Reparatur', 'Büromaterial', 'Versicherung', 'Kaution Rückzahlung', 'Sonstiges'];

    function updateCategories(type) {
        const select = document.getElementById('categorySelect');
        select.innerHTML = '';
        const categories = type === 'income' ? incomeCategories : expenseCategories;
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });
        
        // Visual feedback for radio buttons
        if (type === 'income') {
            document.getElementById('incomeLabel').style.borderColor = 'var(--primary)';
            document.getElementById('incomeLabel').style.background = 'rgba(227,30,36,0.05)';
            document.getElementById('expenseLabel').style.borderColor = '#f0f0f0';
            document.getElementById('expenseLabel').style.background = 'transparent';
        } else {
            document.getElementById('expenseLabel').style.borderColor = 'var(--primary)';
            document.getElementById('expenseLabel').style.background = 'rgba(227,30,36,0.05)';
            document.getElementById('incomeLabel').style.borderColor = '#f0f0f0';
            document.getElementById('incomeLabel').style.background = 'transparent';
        }
    }

    updateCategories('income');
</script>

<?php require_once 'footer.php'; ?>
