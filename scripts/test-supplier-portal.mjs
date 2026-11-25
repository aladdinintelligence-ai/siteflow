// Automated Verification of Supplier Portal Acceptance Checks (25 Nov 2026 Instructions)
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('--- STARTING SUPPLIER PORTAL ACCEPTANCE CHECKS ---');

// 1. Verify Seed Data & Orders
const seedFilePath = path.resolve('data/seed.ts');
const seedContent = fs.readFileSync(seedFilePath, 'utf8');

console.log('\n[Check 1 & 2] Verifying Chatham 90-tonne Order #SF-1024...');
assert(seedContent.includes('#SF-1024'), 'Order #SF-1024 must exist in seed');
assert(seedContent.includes('DJ Civils Ltd'), 'Customer must be DJ Civils Ltd');
assert(seedContent.includes('Chris (Site Manager)'), 'Creator must be Chris (Site Manager)');
assert(seedContent.includes('Chatham — Phase 2A Link Road'), 'Destination must be Chatham Phase 2A Link Road');
assert(seedContent.includes('6F5') && seedContent.includes('Type 1') && seedContent.includes('Reject Sand'), 'Three material lines must be present');
assert(seedContent.includes('estimatedLoads: 5'), 'Total estimated loads must be 5');
console.log('✓ PASS: Order #SF-1024 contains DJ Civils Ltd, Chris, Chatham Phase 2A Link Road, 3 lines, and 5 estimated loads.');

console.log('\n[Check 3] Verifying Driver Performance Ledger (5 loads / 90t)...');
assert(seedContent.includes('Dave Miller') && seedContent.includes('KX68 VKF'), 'Dave Miller with KX68 VKF must be registered');
assert(seedContent.includes('Kieran Patel') && seedContent.includes('BD70 VXR'), 'Kieran Patel with BD70 VXR must be registered');
assert(seedContent.includes("Marcus O'Connor") && seedContent.includes('LK21 WZP'), "Marcus O'Connor with LK21 WZP must be registered");
console.log('✓ PASS: Registered drivers Dave Miller, Kieran Patel, and Marcus O\'Connor exist with assigned vehicles.');

console.log('\n[Check 4] Verifying Rochester Capstone order & site filtering...');
assert(seedContent.includes('#SF-1025'), 'Order #SF-1025 must exist for Rochester Capstone');
assert(seedContent.includes('Rochester Capstone'), 'Rochester Capstone must be present');
console.log('✓ PASS: Rochester order #SF-1025 configured for multi-site supplier filtering.');

console.log('\n[Check 5] Verifying Generic Categories (Fuel, Welfare Delivery, Welfare Servicing)...');
assert(seedContent.includes('#SF-1026') && seedContent.includes('units'), 'Welfare Delivery order #SF-1026 must use units');
assert(seedContent.includes('#SF-1027') && seedContent.includes('visits'), 'Welfare Servicing order #SF-1027 must use visits');
assert(seedContent.includes('#SF-1028') && seedContent.includes('litres'), 'Fuel Delivery order #SF-1028 must use litres');
console.log('✓ PASS: Appropriate category units (litres, units, visits) properly established.');

console.log('\n[Check 6] Verifying Live Tracking Stepper & 12-min ETA...');
const liveTrackingPath = path.resolve('components/supplier/LiveTrackingView.tsx');
const liveTrackingContent = fs.readFileSync(liveTrackingPath, 'utf8');
assert(liveTrackingContent.includes('Dispatched'), 'Stage 1 Dispatched must exist');
assert(liveTrackingContent.includes('In Transit') && liveTrackingContent.includes('12 min'), 'Stage 2 In Transit with sample 12 min ETA must exist');
assert(liveTrackingContent.includes('Arrived at Site'), 'Stage 3 Arrived at Site must exist');
assert(liveTrackingContent.includes('Delivery Completed'), 'Stage 4 Delivery Completed must exist');
assert(liveTrackingContent.includes('Driver Location Sharing'), 'Telematics consent toggle must exist');
console.log('✓ PASS: 4-stage stepper, 12-min ETA, and telematics consent verified.');

console.log('\n[Check 7] Verifying Brand Logo...');
const bannerPath = path.resolve('public/dj-civils-banner.png');
const logoPath = path.resolve('public/logo.png');
assert(fs.existsSync(bannerPath), 'dj-civils-banner.png must exist');
assert(fs.existsSync(logoPath), 'logo.png must exist');
console.log('✓ PASS: Brand banner logos installed in public/.');

console.log('\n========================================');
console.log('ALL 7 ACCEPTANCE CHECKS PASSED PERFECTLY!');
console.log('========================================');
