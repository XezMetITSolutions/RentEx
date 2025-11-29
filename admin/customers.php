<?php
require_once 'header.php';
require_once '../includes/db.php';

// Handle Add Customer
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['add_customer'])) {
    $firstname = $_POST['firstname'];
    $lastname = $_POST['lastname'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $address = $_POST['address'];
    $license = $_POST['license'];

    $stmt = $pdo->prepare("INSERT INTO customers (firstname, lastname, email, phone, address, license_number) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$firstname, $lastname, $email, $phone, $address, $license]);
    header("Location: customers.php");
    exit;
}

// Handle Delete
if (isset($_GET['delete'])) {
    $id = $_GET['delete'];
    $stmt = $pdo->prepare("DELETE FROM customers WHERE id = ?");
    $stmt->execute([$id]);
    header("Location: customers.php");
    exit;
}

// Fetch Customers
$search = $_GET['search'] ?? '';
$query = "SELECT * FROM customers WHERE firstname LIKE ? OR lastname LIKE ? OR email LIKE ? ORDER BY created_at DESC";
$stmt = $pdo->prepare($query);
$params = ["%$search%", "%$search%", "%$search%"];
$stmt->execute($params);
$customers = $stmt->fetchAll();
?>

<div class="page-title" style="display:flex; justify-content:space-between; align-items:center;">
    <div>
        <div style="display:flex; align-items:center; gap:1rem;">
            <div style="background:#8b5cf6; color:white; width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:1.2rem;">
                <i class="fas fa-users"></i>
            </div>
            <h1 style="margin:0; color:#8b5cf6;">Kundenverwaltung</h1>
        </div>
        <p style="margin-left: 3.5rem; margin-top: 0.2rem;">Kundendaten und Historie verwalten</p>
    </div>
    <button onclick="document.getElementById('addCustomerModal').style.display='flex'" class="btn btn-primary" style="background-color: #8b5cf6; border-color: #8b5cf6;">
        <i class="fas fa-plus"></i> Neuer Kunde
    </button>
</div>

<!-- Search Bar -->
<div class="filter-bar">
    <div class="search-input">
        <i class="fas fa-search"></i>
        <input type="text" placeholder="Suche nach Name oder Email..." value="<?php echo htmlspecialchars($search); ?>" onkeyup="if(event.key === 'Enter') window.location.href='?search='+this.value">
    </div>
</div>

<!-- Customers Table -->
<div style="background:white; border-radius:var(--radius); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow:hidden;">
    <div class="cars-table-header" style="grid-template-columns: 2fr 2fr 1.5fr 1.5fr 1fr;">
        <div>Name</div>
        <div>Kontakt</div>
        <div>Adresse</div>
        <div>Führerschein</div>
        <div>Aktionen</div>
    </div>
    
    <?php foreach ($customers as $c): ?>
    <div class="cars-table-row" style="grid-template-columns: 2fr 2fr 1.5fr 1.5fr 1fr;">
        <div style="font-weight:700;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
                <div style="width:32px; height:32px; background:#f3e8ff; color:#8b5cf6; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:0.8rem;">
                    <?php echo strtoupper(substr($c['firstname'], 0, 1) . substr($c['lastname'], 0, 1)); ?>
                </div>
                <?php echo htmlspecialchars($c['firstname'] . ' ' . $c['lastname']); ?>
            </div>
        </div>
        <div>
            <div style="font-size:0.9rem;"><i class="fas fa-envelope" style="color:#94a3b8; width:16px;"></i> <?php echo htmlspecialchars($c['email']); ?></div>
            <div style="font-size:0.9rem;"><i class="fas fa-phone" style="color:#94a3b8; width:16px;"></i> <?php echo htmlspecialchars($c['phone']); ?></div>
        </div>
        <div style="font-size:0.9rem; color:#64748b;"><?php echo htmlspecialchars($c['address']); ?></div>
        <div style="font-family:monospace; background:#f1f5f9; padding:0.2rem 0.5rem; border-radius:4px; display:inline-block;"><?php echo htmlspecialchars($c['license_number']); ?></div>
        <div style="display:flex; gap:0.5rem;">
            <button class="action-btn btn-blue"><i class="fas fa-edit"></i></button>
            <a href="?delete=<?php echo $c['id']; ?>" onclick="return confirm('Kunde wirklich löschen?')" class="action-btn btn-red"><i class="fas fa-trash"></i></a>
        </div>
    </div>
    <?php endforeach; ?>
</div>

<!-- Add Customer Modal -->
<div id="addCustomerModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:2000; align-items: center; justify-content: center;">
    <div style="background:var(--card-bg); width:500px; padding:2rem; border-radius:12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
        <h3 style="margin-bottom:1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">Neuen Kunden anlegen</h3>
        <form method="POST">
            <div style="display:flex; gap:1rem;">
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Vorname</label>
                    <input type="text" name="firstname" required style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Nachname</label>
                    <input type="text" name="lastname" required style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
            </div>

            <div style="display:flex; gap:1rem;">
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Email</label>
                    <input type="email" name="email" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
                <div style="margin-bottom:1rem; flex:1;">
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Telefon</label>
                    <input type="text" name="phone" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
                </div>
            </div>

            <div style="margin-bottom:1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Adresse</label>
                <input type="text" name="address" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
            </div>

            <div style="margin-bottom:2rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight:500;">Führerschein-Nr.</label>
                <input type="text" name="license" style="width:100%; padding: 0.6rem; border: 1px solid var(--border); border-radius: 6px;">
            </div>

            <div style="display:flex; justify-content:flex-end; gap:1rem;">
                <button type="button" onclick="document.getElementById('addCustomerModal').style.display='none'" style="padding: 0.6rem 1.2rem; border: 1px solid var(--border); background: transparent; border-radius: 6px; cursor: pointer;">Abbrechen</button>
                <button type="submit" name="add_customer" class="btn btn-primary" style="background-color: #8b5cf6; border-color: #8b5cf6;">Speichern</button>
            </div>
        </form>
    </div>
</div>

<?php require_once 'footer.php'; ?>
