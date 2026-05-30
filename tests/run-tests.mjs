import assert from 'assert';
import { prepareAppStateData } from '../generateFoodAppInsight.js';

function run() {
  console.log('Running unit tests for prepareAppStateData...');

  const donations = [
    { id: 1, category: 'vegetables', status: 'available', weight_kg: 2, created_at: new Date().toISOString() },
    { id: 2, category: 'bread', status: 'claimed', weight_kg: 1 },
    { id: 3, category: 'vegetables', status: 'delivered', weight_kg: 3 },
  ];

  const users = [
    { id: 'u1', role: 'volunteer', is_active: true },
    { id: 'u2', role: 'receiver', has_pending_request: true, organization_name: 'Shelter A', immediate_need: { meals: 50 } },
  ];

  const campaigns = [
    { id: 'c1', status: 'active', raised_amount: 1000 },
  ];

  const currentUser = { id: 'u2', role: 'receiver', location: 'CityX' };

  const state = prepareAppStateData(donations, users, campaigns, currentUser);

  try {
    assert.strictEqual(state.totalDonations, 3, 'totalDonations should be 3');
    assert.strictEqual(state.availableDonations, 1, 'availableDonations should be 1');
    assert.strictEqual(state.claimedDonations, 1, 'claimedDonations should be 1');
    assert.strictEqual(state.deliveredDonations, 1, 'deliveredDonations should be 1');
    assert.strictEqual(state.activeVolunteers, 1, 'activeVolunteers should be 1');
    assert.strictEqual(state.activeCampaigns, 1, 'activeCampaigns should be 1');
    assert.strictEqual(state.totalDonatedWeightKg, 6, 'total weight should be sum of weights');

    console.log('All tests passed ✅');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err.message);
    process.exit(1);
  }
}

run();
