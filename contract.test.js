class SimpleEventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      callback(data);
    });
  }
}

function validatePayload(payload) {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    errors.push('❌ Le payload doit être un objet');
    return { valid: false, errors };
  }

  const requiredFields = ['id', 'name', 'price'];

  requiredFields.forEach(field => {
    if (!(field in payload)) {
      errors.push(`❌ Champ manquant: "${field}"`);
    }
  });

  if (payload.id !== undefined && typeof payload.id !== 'string') {
    errors.push(`❌ "id" doit être un string, reçu: ${typeof payload.id}`);
  }

  if (payload.name !== undefined && typeof payload.name !== 'string') {
    errors.push(`❌ "name" doit être un string, reçu: ${typeof payload.name}`);
  }

  if (payload.price !== undefined && typeof payload.price !== 'number') {
    errors.push(`❌ "price" doit être un number, reçu: ${typeof payload.price}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

console.log('🧪 Contract Test - cart:add payload\n');
console.log('=' .repeat(60));

const eventBus = new SimpleEventBus();
let testsPassed = 0;
let testsFailed = 0;

console.log('\n✅ Test 1: Payload valide');
const validPayload = {
  id: 'gameboy-tetris',
  name: 'Game Boy - Tetris',
  price: 29.99,
};

const result1 = validatePayload(validPayload);
console.log('Payload:', JSON.stringify(validPayload, null, 2));
console.log('Résultat:', result1.valid ? '✓ VALIDE' : '✗ INVALIDE');
if (result1.errors.length > 0) {
  result1.errors.forEach(err => console.log('  ' + err));
}

if (result1.valid) {
  testsPassed++;
  console.log('✓ Test réussi');
} else {
  testsFailed++;
  console.log('✗ Test échoué');
}

console.log('\n❌ Test 2: Payload invalide (champ manquant: price)');
const invalidPayload1 = {
  id: 'snes-mario',
  name: 'SNES - Super Mario World',
};

const result2 = validatePayload(invalidPayload1);
console.log('Payload:', JSON.stringify(invalidPayload1, null, 2));
console.log('Résultat:', result2.valid ? '✓ VALIDE' : '✗ INVALIDE');
result2.errors.forEach(err => console.log('  ' + err));

if (!result2.valid) {
  testsPassed++;
  console.log('✓ Test réussi (détection correcte)');
} else {
  testsFailed++;
  console.log('✗ Test échoué');
}

console.log('\n❌ Test 3: Payload invalide (price est un string au lieu de number)');
const invalidPayload2 = {
  id: 'n64-mario-kart',
  name: 'N64 - Mario Kart 64',
  price: '54.99',
};

const result3 = validatePayload(invalidPayload2);
console.log('Payload:', JSON.stringify(invalidPayload2, null, 2));
console.log('Résultat:', result3.valid ? '✓ VALIDE' : '✗ INVALIDE');
result3.errors.forEach(err => console.log('  ' + err));

if (!result3.valid) {
  testsPassed++;
  console.log('✓ Test réussi (détection correcte)');
} else {
  testsFailed++;
  console.log('✗ Test échoué');
}

console.log('\n🔄 Test 4: Simulation EventBus avec payload valide');
let receivedPayload = null;

eventBus.on('cart:add', (product) => {
  receivedPayload = product;
});

eventBus.emit('cart:add', validPayload);

if (receivedPayload && receivedPayload.id === 'gameboy-tetris') {
  testsPassed++;
  console.log('✓ Payload reçu correctement par Cart:', JSON.stringify(receivedPayload));
  console.log('✓ Test réussi');
} else {
  testsFailed++;
  console.log('✗ Test échoué');
}

console.log('\n' + '='.repeat(60));
console.log('\n📊 Résumé des tests:');
console.log(`  ✓ Tests réussis: ${testsPassed}`);
console.log(`  ✗ Tests échoués: ${testsFailed}`);
console.log(`  Total: ${testsPassed + testsFailed}`);

const allPassed = testsFailed === 0;
console.log('\n' + (allPassed ? '✅ Tous les tests sont passés!' : '❌ Certains tests ont échoué'));

process.exit(allPassed ? 0 : 1);
