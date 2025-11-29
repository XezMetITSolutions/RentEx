<?php
require_once 'header.php';
require_once '../includes/db.php';

$month = $_GET['month'] ?? date('Y-m');

// 1. Booking Revenue (Confirmed/Completed)
$stmt = $pdo->prepare("SELECT SUM(total_price) FROM bookings WHERE (status = 'confirmed' OR status = 'completed') AND DATE_FORMAT(start_date, '%Y-%m') = ?");
$stmt->execute([$month]);
$booking_revenue = $stmt->fetchColumn() ?: 0;

// 2. POS Income (Cash/Card)
$stmt = $pdo->prepare("SELECT SUM(amount) FROM cash_register WHERE transaction_type = 'income' AND DATE_FORMAT(created_at, '%Y-%m') = ?");
$stmt->execute([$month]);
$pos_income = $stmt->fetchColumn() ?: 0;

// 3. POS Expenses
$stmt = $pdo->prepare("SELECT SUM(amount) FROM cash_register WHERE transaction_type = 'expense' AND DATE_FORMAT(created_at, '%Y-%m') = ?");
$stmt->execute([$month]);
$pos_expenses = $stmt->fetchColumn() ?: 0;

// Total Revenue (Note: This might double count if POS entries are linked to bookings, but for now we treat them as separate or user manages it)
// A better approach: Show them separately.

?>

<div class="page-title">
    <div style="display:flex; align-items:center; gap:1rem;">
        <div style="background:#8b5cf6; color:white; width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
            <i class="fas fa-file-invoice-dollar"></i>
        </div>
        <h1 style="margin:0; color:#8b5cf6;">Finanzen</h1>
    </div>
    <p style="margin-left: 3.5rem; margin-top: 0.2rem;">Finanzübersicht und Berichte</p>
</div>

<!-- Filter -->
<div class="filter-bar">
    <div class="filter-select">
        <i class="fas fa-calendar"></i>
        <input type="month" value="<?php echo $month; ?>" onchange="window.location.href='?month='+this.value" style="border:none; background:transparent; outline:none; font-family:inherit;">
    </div>
</div>

<!-- Stats -->
<div class="stats-row">
    <div class="stat-card">
        <div class="stat-header">
            <div class="stat-icon icon-blue"><i class="fas fa-car"></i></div>
            <span class="stat-badge">Buchungen</span>
        </div>
        <div class="stat-label">Umsatz aus Reservierungen</div>
        <div class="stat-value">€<?php echo number_format($booking_revenue, 2, ',', '.'); ?></div>
    </div>
    <div class="stat-card">
        <div class="stat-header">
            <div class="stat-icon icon-green"><i class="fas fa-cash-register"></i></div>
            <span class="stat-badge">Kasse</span>
        </div>
        <div class="stat-label">Einnahmen (POS)</div>
        <div class="stat-value">€<?php echo number_format($pos_income, 2, ',', '.'); ?></div>
    </div>
    <div class="stat-card">
        <div class="stat-header">
            <div class="stat-icon icon-red" style="background:#fef2f2; color:#ef4444;"><i class="fas fa-arrow-down"></i></div>
            <span class="stat-badge">Ausgaben</span>
        </div>
        <div class="stat-label">Ausgaben (POS)</div>
        <div class="stat-value text-red">-€<?php echo number_format($pos_expenses, 2, ',', '.'); ?></div>
    </div>
</div>

<div class="dashboard-grid">
    <div class="content-card">
        <div class="card-title">
            <i class="fas fa-chart-pie" style="color:#3b82f6;"></i> Einnahmenverteilung
        </div>
        <div style="height:200px; display:flex; align-items:center; justify-content:center; color:#94a3b8;">
            <!-- Placeholder for Chart -->
            <p>Diagramm wird geladen...</p>
        </div>
    </div>
    <div class="content-card">
        <div class="card-title">
            <i class="fas fa-file-invoice" style="color:#8b5cf6;"></i> Letzte Rechnungen
        </div>
        <div style="color:#94a3b8; text-align:center; padding:2rem;">
            Funktion folgt in Kürze.
        </div>
    </div>
</div>

<?php require_once 'footer.php'; ?>
