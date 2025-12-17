<?php
require_once 'header.php';
require_once '../includes/db.php';

$month = $_GET['month'] ?? date('Y-m');

try {
    // 1. Booking Revenue
    $stmt = $pdo->prepare("SELECT SUM(total_price) FROM bookings WHERE (status = 'confirmed' OR status = 'completed') AND DATE_FORMAT(start_date, '%Y-%m') = ?");
    $stmt->execute([$month]);
    $booking_revenue = $stmt->fetchColumn() ?: 0;

    // 2. POS Income
    $stmt = $pdo->prepare("SELECT SUM(amount) FROM cash_register WHERE transaction_type = 'income' AND DATE_FORMAT(created_at, '%Y-%m') = ?");
    $stmt->execute([$month]);
    $pos_income = $stmt->fetchColumn() ?: 0;

    // 3. POS Expenses
    $stmt = $pdo->prepare("SELECT SUM(amount) FROM cash_register WHERE transaction_type = 'expense' AND DATE_FORMAT(created_at, '%Y-%m') = ?");
    $stmt->execute([$month]);
    $pos_expenses = $stmt->fetchColumn() ?: 0;
} catch (Exception $e) {
    $booking_revenue = 0; $pos_income = 0; $pos_expenses = 0;
}

$total_profit = ($booking_revenue + $pos_income) - $pos_expenses;
?>

<div style="display: flex; gap: 2rem; margin-bottom: 2rem; align-items: center; background: white; padding: 1.5rem; border-radius: var(--radius); box-shadow: var(--shadow);">
    <div style="flex: 1;">
        <input type="month" value="<?php echo $month; ?>" onchange="window.location.href='?month='+this.value" style="padding: 10px; border-radius: 10px; border: 1px solid var(--border); background: #f8fafc; outline: none; font-weight: 600;">
    </div>
    <div style="display: flex; gap: 3rem;">
        <div style="text-align: right;">
            <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Gesamtgewinn</div>
            <div style="font-size: 1.5rem; font-weight: 900; color: <?php echo $total_profit >= 0 ? '#10b981' : '#ef4444'; ?>;">€ <?php echo number_format($total_profit, 2, ',', '.'); ?></div>
        </div>
    </div>
</div>

<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-content">
            <h3>Mieteinnahmen</h3>
            <div class="value">€ <?php echo number_format($booking_revenue, 2, ',', '.'); ?></div>
        </div>
        <div class="stat-icon-wrap icon-blue">
            <i class="fas fa-car-side"></i>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-content">
            <h3>Kasseneinnahmen</h3>
            <div class="value">€ <?php echo number_format($pos_income, 2, ',', '.'); ?></div>
        </div>
        <div class="stat-icon-wrap icon-green">
            <i class="fas fa-cash-register"></i>
        </div>
    </div>
    <div class="stat-card">
        <div class="stat-content">
            <h3>Gesamtausgaben</h3>
            <div class="value" style="color: #ef4444;">-€ <?php echo number_format($pos_expenses, 2, ',', '.'); ?></div>
        </div>
        <div class="stat-icon-wrap icon-red">
            <i class="fas fa-file-invoice-dollar"></i>
        </div>
    </div>
</div>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
    <div class="table-container">
        <div class="table-header">
            <h2>Einnahmen-Verteilung</h2>
        </div>
        <div style="padding: 2rem; text-align: center;">
            <div style="width: 200px; height: 200px; border-radius: 50%; background: conic-gradient(#3b82f6 0% 65%, #10b981 65% 100%); margin: 0 auto 2rem; position: relative;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 140px; height: 140px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem;">Finanzen</div>
            </div>
            <div style="display: flex; justify-content: center; gap: 2rem;">
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600;"><span style="width: 12px; height: 12px; background: #3b82f6; border-radius: 3px;"></span> Miete</div>
                <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 600;"><span style="width: 12px; height: 12px; background: #10b981; border-radius: 3px;"></span> POS</div>
            </div>
        </div>
    </div>

    <div class="table-container">
        <div class="table-header">
            <h2>Letzte Abrechnungen</h2>
        </div>
        <div style="padding: 3rem; text-align: center; color: var(--text-muted);">
            <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 1.5rem; opacity: 0.2;"></i>
            <p>Keine Berichte für diesen Zeitraum verfügbar.</p>
        </div>
    </div>
</div>

<?php require_once 'footer.php'; ?>
