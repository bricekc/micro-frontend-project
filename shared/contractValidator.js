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

  if (!contract) {
    return { valid: true, errors: [] };
  }

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

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function createValidatedEventBus(eventBus) {
  const originalEmit = eventBus.emit.bind(eventBus);

  eventBus.emit = function (event, payload) {
    const validation = validatePayload(event, payload);

    if (!validation.valid) {
      const errorMsg = validation.errors.join(', ');
      console.error(
        `[CONTRACT VIOLATION] ${event} — ${errorMsg}`
      );
      return false;
    }

    return originalEmit(event, payload);
  };

  return eventBus;
}

export { validatePayload, CONTRACTS };
