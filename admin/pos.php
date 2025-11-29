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
    
    // Generate Receipt Number: R-YYYYMMDD-XXXX (Random 4 digits)
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

// Calculate Balance (Cash Only for "Kassenstand", but maybe show Total too)
// Usually "Registrierkasse" balance refers to Cash.
$cash_balance = 0;
$total_income = 0;
$total_expense = 0;

// Get initial balance (sum of all previous months) - simplified for now, assuming we just sum everything for "Current Balance"
// A real system would have daily closings.
$balance_stmt = $pdo->query("SELECT 
    SUM(CASE WHEN transaction_type = 'income' AND payment_method = 'cash' THEN amount ELSE 0 END) as cash_in,
    SUM(CASE WHEN transaction_type = 'expense' AND payment_method = 'cash' THEN amount ELSE 0 END) as cash_out
    FROM cash_register");
$balance_row = $balance_stmt->fetch();
$current_cash_balance = ($balance_row['cash_in'] ?? 0) - ($balance_row['cash_out'] ?? 0);

// Stats for current view
foreach ($transactions as $t) {
    if ($t['transaction_type'] == 'income') $total_income += $t['amount'];
    if ($t['transaction_type'] == 'expense') $total_expense += $t['amount'];
}
?>

<div class="page-title" style="display:flex; justify-content:space-between; align-items:center;">
    <div>
        <div style="display:flex; align-items:center; gap:1rem;">
            <div style="background:#f59e0b; color:white; width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                <i class="fas fa-cash-register"></i>
            </div>
            <h1 style="margin:0; color:#f59e0b;">Registrierkasse</h1>
        </div>
        <p style="margin-left: 3.5rem; margin-top: 0.2rem;">Einnahmen und Ausgaben verwalten</p>
    </div>
    <button onclick="document.getElementById('addTransactionModal').style.display='flex'" class="btn btn-primary" style="background-color: #f59e0b; border-color: #f59e0b;">
        <i class="fas fa-plus"></i> Neue Buchung
    </button>
</div>

<!-- Stats Cards -->
<div class="stats-row">
    <div class="stat-card">
        <div class="stat-header">
            <div class="stat-icon icon-green"><i class="fas fa-wallet"></i></div>
            <span class="stat-badge">Aktuell</span>
        </div>
        <div class="stat-label">Kassenstand (Bar)</div>
        <div class="stat-value">€<?php echo number_format($current_cash_balance, 2, ',', '.'); ?></div>
    </div>
    <div class="stat-card">
        <div class="stat-header">
            <div class="stat-icon icon-blue"><i class="fas fa-arrow-down"></i></div>
            <span class="stat-badge"><?php echo date('M Y', strtotime($filter_month)); ?></span>
        </div>
        <div class="stat-label">Einnahmen</div>
        <div class="stat-value text-green">+€<?php echo number_format($total_income, 2, ',', '.'); ?></div>
    </div>
    <div class="stat-card">
        <div class="stat-header">
            <div class="stat-icon icon-orange"><i class="fas fa-arrow-up"></i></div>
            <span class="stat-badge"><?php echo date('M Y', strtotime($filter_month)); ?></span>
        </div>
        <div class="stat-label">Ausgaben</div>
        <div class="stat-value text-red">-€<?php echo number_format($total_expense, 2, ',', '.'); ?></div>
    </div>
</div>

<!-- Filter Bar -->
<div class="filter-bar">
    <div class="filter-select">
        <i class="fas fa-calendar"></i>
        <input type="month" value="<?php echo $filter_month; ?>" onchange="window.location.href='?month='+this.value" style="border:none; background:transparent; outline:none; font-family:inherit;">
    </div>
    <div style="margin-left:auto;">
        <button class="btn" style="background:white; border:1px solid var(--border);" onclick="window.print()"><i class="fas fa-print"></i> Liste Drucken</button>
    </div>
</div>

<!-- Transactions Table -->
<div style="background:white; border-radius:var(--radius); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow:hidden;">
    <div class="cars-table-header" style="grid-template-columns: 1fr 1fr 2fr 1fr 1fr 1fr 0.5fr;">
        <div>Datum / Nr.</div>
        <div>Typ</div>
        <div>Beschreibung</div>
        <div>Kategorie</div>
        <div>Zahlung</div>
        <div>Betrag</div>
        <div></div>
    </div>
    
    <?php if (count($transactions) > 0): ?>
        <?php foreach ($transactions as $t): ?>
        <div class="cars-table-row" style="grid-template-columns: 1fr 1fr 2fr 1fr 1fr 1fr 0.5fr;">
            <div>
                <div style="font-weight:600;"><?php echo date('d.m.Y H:i', strtotime($t['created_at'])); ?></div>
                <div style="font-size:0.8rem; color:#64748b; font-family:monospace;"><?php echo htmlspecialchars($t['receipt_number']); ?></div>
            </div>
            <div>
                <?php if ($t['transaction_type'] == 'income'): ?>
                    <span class="badge badge-available"><i class="fas fa-plus"></i> Einnahme</span>
                <?php else: ?>
                    <span class="badge badge-rented"><i class="fas fa-minus"></i> Ausgabe</span>
                <?php endif; ?>
            </div>
            <div>
                <div style="font-weight:600;"><?php echo htmlspecialchars($t['description']); ?></div>
            </div>
            <div style="color:#64748b;"><?php echo htmlspecialchars($t['category']); ?></div>
            <div>
                <?php 
                    $icon = 'money-bill-wave';
                    if ($t['payment_method'] == 'card') $icon = 'credit-card';
                    if ($t['payment_method'] == 'transfer') $icon = 'university';
                ?>
                <i class="fas fa-<?php echo $icon; ?>"></i> <?php echo ucfirst($t['payment_method']); ?>
            </div>
            <div style="font-weight:700; color: <?php echo $t['transaction_type'] == 'income' ? '#10b981' : '#ef4444'; ?>;">
                <?php echo $t['transaction_type'] == 'income' ? '+' : '-'; ?>€<?php echo number_format($t['amount'], 2, ',', '.'); ?>
            </div>
            <div style="display:flex; justify-content:flex-end;">
                <a href="receipt.php?id=<?php echo $t['id']; ?>" target="_blank" class="action-btn btn-blue" title="Beleg drucken"><i class="fas fa-print"></i></a>
            </div>
        </div>
        <?php endforeach; ?>
    <?php else: ?>
        <div style="padding: 2rem; text-align: center; color: #64748b;">
            Keine Buchungen für diesen Monat gefunden.
        </div>
    <?php endif; ?>
</div>

<!-- Add Transaction Modal -->
<div id="addTransactionModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:2000; align-items: center; justify-content: center;">
    <div style="background:var(--card-bg); width:500px; padding:2rem; border-radius:12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
        <h3 style="margin-bottom:1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">Neue Buchung</h3>
        <form method="POST">
            <div style="margin-bottom:1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Typ</label>
                <div style="display:flex; gap:1rem;">
                    <label style="flex:1; cursor:pointer; border:1px solid var(--border); padding:0.5rem; border-radius:6px; text-align:center;">
                        <input type="radio" name="type" value="income" checked onclick="updateCategories('income')"> Einnahme
                    </label>
                    <label style="flex:1; cursor:pointer; border:1px solid var(--border); padding:0.5rem; border-radius:6px; text-align:center;">
                        <input type="radio" name="type" value="expense" onclick="updateCategories('expense')"> Ausgabe
                    </label>
                </div>
            </div>

            <div style="display:flex; gap:1rem;">
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Betrag (€)</label>
                    <input type="number" step="0.01" name="amount" required style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Steuersatz (%)</label>
                    <select name="tax_rate" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                        <option value="20">20% (Normal)</option>
                        <option value="10">10% (Ermäßigt)</option>
                        <option value="0">0% (Steuerfrei)</option>
                    </select>
                </div>
            </div>

            <div style="margin-bottom:1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Kategorie</label>
                <select name="category" id="categorySelect" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                    <!-- Populated by JS -->
                </select>
            </div>

            <div style="margin-bottom:1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Beschreibung</label>
                <input type="text" name="description" required placeholder="z.B. Miete für VW Golf" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
            </div>

            <div style="margin-bottom:2rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Zahlungsmethode</label>
                <select name="payment_method" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                    <option value="cash">Barzahlung</option>
                    <option value="card">Kartenzahlung</option>
                    <option value="transfer">Überweisung</option>
                </select>
            </div>

            <div style="display:flex; justify-content:flex-end; gap:1rem;">
                <button type="button" onclick="document.getElementById('addTransactionModal').style.display='none'" style="padding: 0.6rem 1.2rem; border: 1px solid var(--border); background: transparent; border-radius: 6px; cursor: pointer;">Abbrechen</button>
                <button type="submit" name="add_transaction" class="btn btn-primary" style="background-color: #f59e0b; border-color: #f59e0b;">Buchen</button>
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
    }

    // Init
    updateCategories('income');
</script>

<?php require_once 'footer.php'; ?>
