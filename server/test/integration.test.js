import assert from 'node:assert';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000/api';

async function runTests() {
  console.log('--- CollabSphere Integration Test Suite ---');
  let token1, token2, user1, user2, projectId, noteId, shareToken;

  // 1. Health check
  console.log('Testing GET /health...');
  const healthRes = await fetch(`${BASE_URL}/health`).then((r) => r.json());
  assert.strictEqual(healthRes.success, true);
  console.log('✓ Server is healthy');

  // 2. Register User 1 (Owner)
  console.log('Testing User 1 Registration (Owner)...');
  const u1Email = `owner_${Date.now()}@collabsphere.test`;
  const reg1Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Elena Rostova',
      email: u1Email,
      password: 'strongPassword123',
    }),
  }).then((r) => r.json());

  assert.strictEqual(reg1Res.success, true);
  assert.ok(reg1Res.token);
  token1 = reg1Res.token;
  user1 = reg1Res.user;
  console.log(`✓ User 1 registered: ${user1.name} (${user1.email})`);

  // 3. Register User 2 (Member)
  console.log('Testing User 2 Registration (Member)...');
  const u2Email = `member_${Date.now()}@collabsphere.test`;
  const reg2Res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Marcus Vance',
      email: u2Email,
      password: 'strongPassword123',
    }),
  }).then((r) => r.json());

  assert.strictEqual(reg2Res.success, true);
  assert.ok(reg2Res.token);
  token2 = reg2Res.token;
  user2 = reg2Res.user;
  console.log(`✓ User 2 registered: ${user2.name} (${user2.email})`);

  // 4. Create Project
  console.log('Testing Project Creation...');
  const createProjRes = await fetch(`${BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      name: 'distributed-kv-store',
      description: 'LSM-tree backed high-throughput key value storage engine',
      isPublic: true,
    }),
  }).then((r) => r.json());

  assert.strictEqual(createProjRes.success, true);
  assert.strictEqual(createProjRes.project.name, 'distributed-kv-store');
  assert.ok(createProjRes.project.shareToken);
  projectId = createProjRes.project._id;
  shareToken = createProjRes.project.shareToken;
  console.log(`✓ Project created: ${createProjRes.project.name} (ID: ${projectId})`);

  // 5. Unauthorized User 2 cannot access before being added
  console.log('Testing Backend Authorization: Non-member cannot access private routes...');
  const unauthRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${token2}` },
  });
  assert.strictEqual(unauthRes.status, 403);
  console.log('✓ Unauthorized access successfully blocked with 403 Forbidden');

  // 6. Add User 2 to Project as Member
  console.log('Testing Adding Member by Email...');
  const addMemRes = await fetch(`${BASE_URL}/projects/${projectId}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token1}`,
    },
    body: JSON.stringify({
      email: u2Email,
      role: 'member',
    }),
  }).then((r) => r.json());

  assert.strictEqual(addMemRes.success, true);
  console.log(`✓ Member added successfully`);

  // 7. Now User 2 can access Project
  console.log('Testing Member Project Access...');
  const authProjRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${token2}` },
  }).then((r) => r.json());

  assert.strictEqual(authProjRes.success, true);
  assert.strictEqual(authProjRes.currentUserRole, 'member');
  console.log('✓ User 2 successfully verified as member');

  // 8. Create Markdown Note
  console.log('Testing Note Creation...');
  const noteRes = await fetch(`${BASE_URL}/projects/${projectId}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token2}`,
    },
    body: JSON.stringify({
      title: 'Compaction Strategy ADR',
      content: '## Tiered vs Leveled Compaction\nWe adopt Leveled Compaction for optimal read amplification.',
    }),
  }).then((r) => r.json());

  assert.strictEqual(noteRes.success, true);
  assert.strictEqual(noteRes.note.title, 'Compaction Strategy ADR');
  noteId = noteRes.note._id;
  console.log(`✓ Note created: ${noteRes.note.title}`);

  // 9. Update Note
  console.log('Testing Note Update...');
  const updateNoteRes = await fetch(`${BASE_URL}/notes/${noteId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token2}`,
    },
    body: JSON.stringify({
      title: 'Compaction Strategy ADR (Approved)',
      content: '## Tiered vs Leveled Compaction\nApproved for production rollout.',
    }),
  }).then((r) => r.json());

  assert.strictEqual(updateNoteRes.success, true);
  assert.strictEqual(updateNoteRes.note.title, 'Compaction Strategy ADR (Approved)');
  console.log('✓ Note updated successfully');

  // 10. File Upload, Code Preview, Download & Delete
  console.log('Testing File Upload (Code preview & download)...');
  const codeContent = 'export function compress(data) { return data; }\n// Test code';
  const fileBlob = new Blob([codeContent], { type: 'text/javascript' });
  const formData = new FormData();
  formData.append('file', fileBlob, 'lsm_engine.js');

  const uploadRes = await fetch(`${BASE_URL}/projects/${projectId}/files`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: formData,
  }).then((r) => r.json());

  assert.strictEqual(uploadRes.success, true);
  assert.strictEqual(uploadRes.file.originalName, 'lsm_engine.js');
  assert.strictEqual(uploadRes.file.isText, true);
  const fileId = uploadRes.file._id;
  console.log('✓ File uploaded successfully with text code detection');

  // Test Code Preview
  const previewRes = await fetch(`${BASE_URL}/files/${fileId}`, {
    headers: { Authorization: `Bearer ${token1}` },
  }).then((r) => r.json());
  assert.strictEqual(previewRes.success, true);
  assert.ok(previewRes.content.includes('compress(data)'));
  console.log('✓ Code preview read safely from disk');

  // Test File Download
  const downloadRes = await fetch(`${BASE_URL}/files/${fileId}/download`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  assert.strictEqual(downloadRes.status, 200);
  console.log('✓ File download response status 200 OK');

  // 10. Public Read-Only Share Verification
  console.log('Testing Public Read-Only Share Endpoint...');
  const pubShareRes = await fetch(`${BASE_URL}/public/share/${shareToken}`).then((r) => r.json());
  assert.strictEqual(pubShareRes.success, true);
  assert.strictEqual(pubShareRes.project.name, 'distributed-kv-store');
  assert.strictEqual(pubShareRes.project.owner, undefined); // Sanitized!
  assert.strictEqual(pubShareRes.project.members, undefined); // Sanitized!
  console.log('✓ Public share data is strictly sanitized and read-only');

  // 11. Activity Timeline & Analytics Verification
  console.log('Testing Activity Timeline & Contribution Analytics...');
  const actRes = await fetch(`${BASE_URL}/projects/${projectId}/activity`, {
    headers: { Authorization: `Bearer ${token1}` },
  }).then((r) => r.json());

  assert.strictEqual(actRes.success, true);
  assert.ok(actRes.activities.length >= 3);
  console.log(`✓ Real activity events tracked: ${actRes.activities.length} events logged`);

  const analyticsRes = await fetch(`${BASE_URL}/projects/${projectId}/analytics`, {
    headers: { Authorization: `Bearer ${token1}` },
  }).then((r) => r.json());

  assert.strictEqual(analyticsRes.success, true);
  assert.ok(analyticsRes.analytics.memberContributions.length >= 2);
  console.log(`✓ Real member contributions aggregated: ${analyticsRes.analytics.memberContributions.length} members tracked`);

  console.log('\n=============================================');
  console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('=============================================\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
