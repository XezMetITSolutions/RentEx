<?php include 'includes/header.php'; ?>

<section class="section-premium" style="padding-top: 15rem;">
    <div class="container">
        <h1 class="title-lg text-center" style="margin-bottom: 3rem;">Häufig gestellte <span class="text-primary">Fragen</span></h1>
        
        <div class="glass" style="padding: 3rem; border-radius: 20px; max-width: 800px; margin: 0 auto;">
            
            <div class="faq-item" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
                <h3 style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="this.nextElementSibling.classList.toggle('hidden')">
                    Wie hoch ist die Kaution?
                    <i class="fas fa-chevron-down text-primary"></i>
                </h3>
                <p class="hidden" style="color: #ccc; margin-top: 1rem; line-height: 1.6;">
                    Die Kaution variiert je nach Fahrzeugklasse, beträgt jedoch in der Regel zwischen 500€ und 2000€. Sie wird auf Ihrer Kreditkarte blockiert und nach Rückgabe freigegeben.
                </p>
            </div>

            <div class="faq-item" style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
                <h3 style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="this.nextElementSibling.classList.toggle('hidden')">
                    Kann ich das Auto im Ausland fahren?
                    <i class="fas fa-chevron-down text-primary"></i>
                </h3>
                <p class="hidden" style="color: #ccc; margin-top: 1rem; line-height: 1.6;">
                    Fahrten in EU-Nachbarländer sind generell gestattet. Bitte informieren Sie uns vorab, da hierfür eine Zusatzversicherung notwendig sein kann.
                </p>
            </div>

            <div class="faq-item">
                <h3 style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;" onclick="this.nextElementSibling.classList.toggle('hidden')">
                    Ab welchem Alter kann ich mieten?
                    <i class="fas fa-chevron-down text-primary"></i>
                </h3>
                <p class="hidden" style="color: #ccc; margin-top: 1rem; line-height: 1.6;">
                    Das Mindestalter beträgt 21 Jahre für Standardfahrzeuge und 25 Jahre für unsere Premium-Sportwagen.
                </p>
            </div>

        </div>
    </div>
</section>

<style>
    .hidden { display: none; }
</style>

<?php include 'includes/footer.php'; ?>
