#!/usr/bin/env node

const bip39 = require('bip39');

// Generate a random mnemonic (uses crypto.randomBytes under the hood), defaults to 128-bits of entropy
const mnemonic = bip39.generateMnemonic();

console.log("Generated Seed Phrase:", mnemonic);
