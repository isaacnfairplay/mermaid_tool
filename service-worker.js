// Listen for install event, set callback
self.addEventListener('install', () => {
    // Service worker installed
  });
  
  self.addEventListener('fetch', (event) => {
    // Respond to fetch event
    event.respondWith(fetch(event.request));
  });
  
  self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_GANTT') {
      cacheGantt(event.data.text);
    }
  });
  
  function cacheGantt(text) {
    const openRequest = indexedDB.open('gantt', 1);
  
    openRequest.onupgradeneeded = function() {
      const db = openRequest.result;
      if (!db.objectStoreNames.contains('texts')) {
        db.createObjectStore('texts');
      }
    };
  
    openRequest.onsuccess = function() {
      const db = openRequest.result;
      const transaction = db.transaction('texts', 'readwrite');
      const texts = transaction.objectStore('texts');
      texts.put(text, 'gantt');
    };
  
    openRequest.onerror = function() {
      console.error('Error', openRequest.error);
    };
  }

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'GET_GANTT') {
      getGantt(event.ports[0]);
    }
  });
  
  function getGantt(port) {
    const openRequest = indexedDB.open('gantt', 1);
  
    openRequest.onsuccess = function() {
      const db = openRequest.result;
      const transaction = db.transaction('texts', 'readonly');
      const texts = transaction.objectStore('texts');
      const getRequest = texts.get('gantt');
  
      getRequest.onsuccess = function() {
        port.postMessage(getRequest.result);
      };
    };
  
    openRequest.onerror = function() {
      console.error('Error', openRequest.error);
    };
  }