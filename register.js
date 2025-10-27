if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('sw.js') // Corregido: sin la barra '/' al inicio
      .then((reg) => {
        console.log('✅ Service Worker registrado con éxito', reg);
      })
      .catch((err) => {
        console.error('❌ Error al registrar el Service Worker', err);
      });
  });
}