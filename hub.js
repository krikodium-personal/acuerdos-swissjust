document.addEventListener("DOMContentLoaded", () => {
    
    // Base de datos de documentos tomada globalmente (data.js)
    const documentsByCountry = window.documentsByCountry || {};

    const selectorContainer = document.getElementById("country-selector");
    const documentsList = document.getElementById("documents-list");
    const countryTitle = document.getElementById("selected-country-title");

    // Función para renderizar los botones de país
    function renderCountryButtons() {
        Object.keys(documentsByCountry).forEach(countryCode => {
            const country = documentsByCountry[countryCode];
            
            const btn = document.createElement("button");
            btn.className = "country-btn";
            btn.textContent = country.name;
            btn.dataset.code = countryCode;
            
            btn.addEventListener("click", () => selectCountry(countryCode));
            
            selectorContainer.appendChild(btn);
        });
    }

    // Función al seleccionar un país en específico
    function selectCountry(countryCode) {
        // Actualizar botones UI
        document.querySelectorAll(".country-btn").forEach(btn => {
            btn.classList.remove("active");
            if (btn.dataset.code === countryCode) {
                btn.classList.add("active");
            }
        });

        const countryData = documentsByCountry[countryCode];
        
        // Actualizar el título con animación
        countryTitle.textContent = `Documentos ${countryData.name}`;
        
        // Vaciar la lista actual
        documentsList.innerHTML = '';
        documentsList.classList.remove("fade-in-content");
        
        // Renderizar los documentos de ese país
        countryData.documents.forEach(doc => {
            const link = document.createElement("a");
            // Apunta al visualizador dinámico que armamos previamente
            link.href = `viewer.html?docType=${doc.id}&country=${countryCode}`; 
            link.className = "document-card";
            link.innerHTML = `
                <div class="doc-icon">EJ</div>
                <div class="doc-info">
                    <span class="doc-title">${doc.title}</span>
                    <span class="doc-type-badge">TIPO: ${doc.id.toUpperCase()}</span>
                </div>
            `;
            documentsList.appendChild(link);
        });

        // Trigger reflow for animation
        void documentsList.offsetWidth; 
        documentsList.classList.add("fade-in-content");
    }

    // Iniciar
    renderCountryButtons();
    
    // Seleccionar por defecto el primero o mediante variable si la hubiera
    const firstCountryCode = Object.keys(documentsByCountry)[0];
    if (firstCountryCode) {
        selectCountry(firstCountryCode);
    }
});
