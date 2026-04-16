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
        // Actualizar la URL sin recargar la página
        const url = new URL(window.location);
        url.searchParams.set('country', countryCode);
        window.history.replaceState({}, '', url);

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
        
        // Vaciar la lista y mostrar estado de carga
        documentsList.innerHTML = '<p style="text-align:center; padding: 2rem;">Cargando documentos...</p>';
        documentsList.classList.remove("fade-in-content");

        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const CMS_API_URL = isLocalhost 
            ? `https://oficinavirtualcms.swissjust.com/items/${countryCode}_legals_docs?fields=id,title`
            : `/api/cms/items/${countryCode}_legals_docs?fields=id,title`;

        fetch(CMS_API_URL)
            .then(res => res.json())
            .then(data => {
                const docs = data.data || [];
                documentsList.innerHTML = '';
                
                if (docs.length === 0) {
                    documentsList.innerHTML = '<p style="text-align:center; padding: 2rem;">No hay documentos disponibles para este país.</p>';
                }
                
                docs.forEach(doc => {
                    const link = document.createElement("a");
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
            })
            .catch(error => {
                console.error("Error loading documents:", error);
                documentsList.innerHTML = '<p style="text-align:center; padding: 2rem;">Error al cargar los documentos.</p>';
            });
    }

    // Iniciar
    renderCountryButtons();
    
    // Seleccionar por defecto el de la URL o el primero
    const urlParams = new URLSearchParams(window.location.search);
    const countryFromUrl = urlParams.get('country');
    const firstCountryCode = Object.keys(documentsByCountry)[0];
    
    if (countryFromUrl && documentsByCountry[countryFromUrl]) {
        selectCountry(countryFromUrl);
    } else if (firstCountryCode) {
        selectCountry(firstCountryCode);
    }
});
