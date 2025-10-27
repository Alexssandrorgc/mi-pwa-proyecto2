const STATIC_CACHE_NAME = 'pouchdb-pwa-static-v1';
const DYNAMIC_CACHE_NAME = 'pouchdb-pwa-dynamic-v1';

// ------------------------------------------------------------------
// IMPORTANTE: Cambia esto por el nombre de tu repositorio en GitHub
// ------------------------------------------------------------------
const REPO_PATH = '/mi-pwa-proyecto2/';

// Lista de archivos locales (App Shell) que necesitan la ruta del repo
const APP_SHELL_ASSETS = [
    `${REPO_PATH}`,
    `${REPO_PATH}index.html`,
    `${REPO_PATH}app.js`,
    `${REPO_PATH}register.js`,
    `${REPO_PATH}manifest.json`,
    `${REPO_PATH}images/icons/192.png`,
    `${REPO_PATH}images/icons/512.png`,
    `${REPO_PATH}images/icons/apple-icon-180x180.png`
];

// Lista de archivos CDN (rutas completas, no necesitan REPO_PATH)
const CDN_ASSETS = [
    'https://cdn.jsdelivr.net/npm/pouchdb@9.0.0/dist/pouchdb.min.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'
];


// --- EVENTO: install ---
self.addEventListener('install', event => {
    console.log('SW: Instalando...');
    
    // Guardamos ambos cachés
    const precache = async () => {
        const staticCache = await caches.open(STATIC_CACHE_NAME);
        await staticCache.addAll(APP_SHELL_ASSETS);
        
        const dynamicCache = await caches.open(DYNAMIC_CACHE_NAME);
        await dynamicCache.addAll(CDN_ASSETS);
    };

    event.waitUntil(precache());
});

// --- EVENTO: activate ---
self.addEventListener('activate', event => {
    console.log('SW: Activado.');
    const cleanUp = caches.keys().then(keys => {
        return Promise.all(
            keys
                .filter(key => key !== STATIC_CACHE_NAME && key !== DYNAMIC_CACHE_NAME)
                .map(key => caches.delete(key))
        );
    });
    event.waitUntil(cleanUp);
});


// --- EVENTO: fetch ---
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Estrategia 1: Cache Only para el App Shell (archivos locales)
    // Comparamos la ruta de la petición con nuestra lista de assets
    if (APP_SHELL_ASSETS.includes(url.pathname)) {
        event.respondWith(caches.match(request, { cacheName: STATIC_CACHE_NAME }));
    } 
    // Estrategia 2: Cache First (con Network Fallback) para todo lo demás (CDNs, etc.)
    else {
        event.respondWith(
            caches.match(request, { cacheName: DYNAMIC_CACHE_NAME })
                .then(cachedResponse => {
                    // Si está en caché, lo retornamos
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    
                    // Si no, vamos a la red
                    return fetch(request).then(networkResponse => {
                        // Y guardamos la respuesta en el caché dinámico para la próxima vez
                        return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                            cache.put(request, networkResponse.clone());
                            return networkResponse;
                        });
                    });
                })
        );
    }
});