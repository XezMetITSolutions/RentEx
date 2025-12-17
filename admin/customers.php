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

<div style="display: flex; gap: 2rem; margin-bottom: 2rem; align-items: center; background: white; padding: 1.5rem; border-radius: var(--radius); box-shadow: var(--shadow);">
    <div style="flex: 1; position: relative;">
        <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--text-muted);"></i>
        <input type="text" placeholder="Kunden suchen (Name, Email...)" value="<?php echo htmlspecialchars($search); ?>" onkeyup="if(event.key === 'Enter') window.location.href='?search='+this.value" style="width: 100%; padding: 12px 15px 12px 45px; border-radius: 15px; border: 1px solid var(--border); background: #f8fafc; outline: none; font-weight: 600;">
    </div>
    <button onclick="document.getElementById('addCustomerModal').style.display='flex'" class="btn btn-primary" style="background: #8b5cf6; box-shadow: 0 10px 20px rgba(139, 92, 246, 0.2);">
        <i class="fas fa-user-plus"></i> Neuer Kunde
    </button>
</div>

<div class="table-container">
    <table class="data-table">
        <thead>
            <tr>
                <th>Kunde</th>
                <th>Kontakt</th>
                <th>Adresse</th>
                <th>Führerschein</th>
                <th style="text-align: right;">Aktionen</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($customers as $c): ?>
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 45px; height: 45px; background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem;">
                            <?php echo strtoupper(substr($c['firstname'], 0, 1) . substr($c['lastname'], 0, 1)); ?>
                        </div>
                        <div>
                            <div style="font-weight: 800; color: var(--secondary);"><?php echo htmlspecialchars($c['firstname'] . ' ' . $c['lastname']); ?></div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">Seit <?php echo date('d.m.Y', strtotime($c['created_at'])); ?></div>
                        </div>
                    </div>
                </td>
                <td>
                    <div style="font-size: 0.9rem; font-weight: 600;"><i class="fas fa-envelope" style="color: #94a3b8; width: 20px;"></i> <?php echo htmlspecialchars($c['email']); ?></div>
                    <div style="font-size: 0.9rem; font-weight: 600; margin-top: 4px;"><i class="fas fa-phone" style="color: #94a3b8; width: 20px;"></i> <?php echo htmlspecialchars($c['phone']); ?></div>
                </td>
                <td>
                    <div style="font-size: 0.85rem; color: #475569; max-width: 200px;"><?php echo htmlspecialchars($c['address']); ?></div>
                </td>
                <td>
                    <div style="font-family: monospace; background: #f1f5f9; padding: 4px 10px; border-radius: 6px; display: inline-block; font-weight: 700; color: #475569;"><?php echo htmlspecialchars($c['license_number']); ?></div>
                </td>
                <td style="text-align: right;">
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button class="btn" style="background: #f1f5f9; color: #475569; padding: 10px;"><i class="fas fa-edit"></i></button>
                        <a href="?delete=<?php echo $c['id']; ?>" onclick="return confirm('Kunde wirklich löschen?')" class="btn" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; padding: 10px;"><i class="fas fa-trash"></i></a>
                    </div>
                </td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>

<!-- Add Customer Modal -->
<div id="addCustomerModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); backdrop-filter: blur(5px); z-index:2000; align-items: center; justify-content: center;">
    <div style="background:white; width:550px; padding:3rem; border-radius:30px; box-shadow: 0 30px 60px rgba(0,0,0,0.2);">
        <h2 style="margin-bottom:2rem; font-weight: 800; letter-spacing: -1px;">Neuen Kunden anlegen</h2>
        <form method="POST">
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem; margin-bottom: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: #8b5cf6; text-transform: uppercase;">Vorname</label>
                    <input type="text" name="firstname" required style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: #8b5cf6; text-transform: uppercase;">Nachname</label>
                    <input type="text" name="lastname" required style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:1.5rem; margin-bottom: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: #8b5cf6; text-transform: uppercase;">Email</label>
                    <input type="email" name="email" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: #8b5cf6; text-transform: uppercase;">Telefon</label>
                    <input type="text" name="phone" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
                </div>
            </div>

            <div style="margin-bottom:1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: #8b5cf6; text-transform: uppercase;">Adresse</label>
                <input type="text" name="address" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
            </div>

            <div style="margin-bottom:2.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-size: 0.8rem; font-weight:700; color: #8b5cf6; text-transform: uppercase;">Führerschein-Nr.</label>
                <input type="text" name="license" style="width:100%; padding: 15px; border: 1px solid var(--border); border-radius: 15px; background: #f8fafc; font-weight: 600;">
            </div>

            <div style="display:flex; justify-content:flex-end; gap:1rem;">
                <button type="button" onclick="document.getElementById('addCustomerModal').style.display='none'" class="btn" style="background: #f1f5f9; color: #475569;">Abbrechen</button>
                <button type="submit" name="add_customer" class="btn btn-primary" style="background: #8b5cf6;">Kunde speichern</button>
            </div>
        </form>
    </div>
</div>

<?php require_once 'footer.php'; ?>
