document.addEventListener("DOMContentLoaded", () => {
    // Mapa de países extraído desde data.js
    const countryNames = window.documentsByCountry || {};

    // Leemos los parámetros de la URL enviados
    const urlParams = new URLSearchParams(window.location.search);
    let country = urlParams.get('country') || 'ar'; // Por defecto: Argentina
    let docType = urlParams.get('docType') || 'bp'; // Por defecto: Business Plan (bp)

    // Referencias al DOM
    const subtitleElement = document.getElementById("country-subtitle");
    const mainTitleElement = document.getElementById("page-main-title");
    const switcherSelect = document.getElementById("document-switcher");
    const contentContainer = document.getElementById("content-container");

    // Datos del país actual
    const currentCountryData = countryNames[country.toLowerCase()];

    // Configurar subtitulo visible del país
    const countryName = currentCountryData ? currentCountryData.name : country.toUpperCase();
    if (subtitleElement) {
        subtitleElement.textContent = countryName;
    }

    // Configurar Dropdown y el Título de "Ver otros Documentos de <pais>"
    if (switcherSelect && currentCountryData) {
        switcherSelect.innerHTML = `<option value="" disabled>Ver otros documentos de ${countryName}...</option>`;
        
        currentCountryData.documents.forEach(doc => {
            const option = document.createElement("option");
            option.value = doc.id;
            option.textContent = doc.title;
            
            if(doc.id === docType) {
                option.selected = true; // El documento actual
                // Set the H1 title immediately using our local DB, avoiding UI Flash
                if (mainTitleElement) {
                    mainTitleElement.textContent = doc.title;
                    mainTitleElement.classList.remove("skeleton-text");
                }
            }
            switcherSelect.appendChild(option);
        });

        // Escuchar cambios en el dropdown para redirigir
        switcherSelect.addEventListener("change", (e) => {
            const newDocType = e.target.value;
            window.location.href = `viewer.html?docType=${newDocType}&country=${country}`;
        });
    }

    // Construimos la URL dinámicamente. 
    // Usamos el Proxy de Vercel en la nube para evadir CORS de manera segura.
    // En desarrollo local seguimos usando la conexión directa.
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const CMS_API_URL = isLocalhost 
        ? `https://oficinavirtualcms.swissjust.com/items/${country}_legals_docs/${docType}?fields=id,title,content`
        : `/api/cms/items/${country}_legals_docs/${docType}?fields=id,title,content`;

    /**
     * Fetch document from CMS and inject it into the page
     */
    async function loadDocument() {
        try {
            const response = await fetch(CMS_API_URL);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            
            // Expected shape: { data: { id: "bp", title: "...", content: "<html...>" } }
            if (data && data.data && data.data.content) {
                // Actualizamos el título de la pestaña del navegador
                if (data.data.title) {
                    document.title = data.data.title + " - SwissJust";
                    
                    // Reemplazamos el título principal H1 ('Acuerdos SwissJust') por el título del doc
                    if (mainTitleElement) {
                        mainTitleElement.textContent = data.data.title;
                    }
                }
                
                // Injectamos el contenido
                contentContainer.innerHTML = data.data.content;
            } else {
                throw new Error("El formato de respuesta del CMS no es válido.");
            }

        } catch (error) {
            console.error("Error cargando el documento:", error);
            contentContainer.innerHTML = `
                <div class="error-message">
                    <h3>No se pudo cargar el documento</h3>
                    <p>Detalles: ${error.message}</p>
                    <p>Por favor, intenta recargar la página más tarde.</p>
                </div>
            `;
        }
    }

    // Start loading content
    loadDocument();
});
