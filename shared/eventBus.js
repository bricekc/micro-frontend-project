/**
 * Event Bus - Communication entre Micro-Frontends
 *
 * Pattern Pub/Sub simple et efficace.
 *
 * Usage:
 *   import eventBus from 'shared/eventBus';
 *
 *   // S'abonner
 *   eventBus.on('event:name', (data) => console.log(data));
 *
 *   // Emettre
 *   eventBus.emit('event:name', { key: 'value' });
 *
 *   // Se desabonner
 *   eventBus.off('event:name', callback);
 */

class EventBus {
  constructor() {
    this.listeners = {};
  }

  /**
   * S'abonner a un evenement
   * @param {string} event - Nom de l'evenement
   * @param {Function} callback - Fonction a appeler
   * @returns {Function} Fonction pour se desabonner
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Retourne une fonction pour se desabonner facilement
    return () => this.off(event, callback);
  }

  /**
   * Se desabonner d'un evenement
   * @param {string} event - Nom de l'evenement
   * @param {Function} callback - Fonction a retirer
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Emettre un evenement
   * @param {string} event - Nom de l'evenement
   * @param {any} data - Donnees a transmettre
   */
  emit(event, data) {
    if (!this.listeners[event]) return;

    // Log pour debug
    console.log(`[EventBus] ${event}`, data);

    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[EventBus] Error in listener for ${event}:`, error);
      }
    });
  }

  /**
   * S'abonner une seule fois
   * @param {string} event - Nom de l'evenement
   * @param {Function} callback - Fonction a appeler
   */
  once(event, callback) {
    const wrapper = (data) => {
      callback(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

// Singleton global - partage entre tous les MFEs
if (!window.__EVENT_BUS__) {
  window.__EVENT_BUS__ = new EventBus();

  const originalEmit = window.__EVENT_BUS__.emit.bind(window.__EVENT_BUS__);
  const CONTRACTS = {
    'cart:add': {
      id: 'string',
      name: 'string',
      price: 'number',
    },
    'cart:updated': {
      items: 'object',
      count: 'number',
      total: 'number',
    },
  };

  function validatePayload(eventName, payload) {
    const errors = [];
    const contract = CONTRACTS[eventName];

    if (!contract) return { valid: true, errors: [] };

    if (!payload || typeof payload !== 'object') {
      errors.push(`payload must be an object, got ${typeof payload}`);
      return { valid: false, errors };
    }

    Object.entries(contract).forEach(([field, expectedType]) => {
      if (!(field in payload)) {
        errors.push(`missing required field: "${field}"`);
        return;
      }

      const actualValue = payload[field];
      const actualType = Array.isArray(actualValue) ? 'array' : typeof actualValue;

      if (expectedType === 'object') {
        if (actualType !== 'object' && actualValue !== null) {
          errors.push(
            `field "${field}" must be object or array, got ${actualType}`
          );
        }
      } else if (actualType !== expectedType) {
        errors.push(
          `field "${field}" must be ${expectedType}, got ${actualType}`
        );
      }
    });

    return { valid: errors.length === 0, errors };
  }

  window.__EVENT_BUS__.emit = function (event, payload) {
    const validation = validatePayload(event, payload);

    if (!validation.valid) {
      const errorMsg = validation.errors.join(', ');
      console.error(`[CONTRACT VIOLATION] ${event} — ${errorMsg}`);
      return false;
    }

    console.log(`[EventBus] ${event}`, payload);

    if (!this.listeners[event]) return;

    this.listeners[event].forEach(callback => {
      try {
        callback(payload);
      } catch (error) {
        console.error(`[EventBus] Error in listener for ${event}:`, error);
      }
    });
  };
}

export default window.__EVENT_BUS__;
