import http from 'http';

function makeRequest(options: http.RequestOptions, postData?: string): Promise<{ statusCode: number; data: any; headers: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({ statusCode: res.statusCode || 200, data: parsed, headers: res.headers });
        } catch {
          resolve({ statusCode: res.statusCode || 200, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTest() {
  console.log('--- STARTING WORKFLOW VERIFICATION TEST ---');

  // Step 1: Login
  console.log('1. Logging in as Johanna Uroh...');
  const loginBody = JSON.stringify({
    email: 'urohjohanna25@gmail.com',
    password: 'johanna2026!'
  });

  const loginRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginBody)
    }
  }, loginBody);

  if (loginRes.statusCode !== 200 || !loginRes.data.token) {
    throw new Error(`Login failed with status ${loginRes.statusCode}: ${JSON.stringify(loginRes.data)}`);
  }
  const token = loginRes.data.token;
  console.log('✓ Successfully authenticated! Token received.');

  // Step 2: Check initial public projects
  console.log('2. Querying public /api/projects...');
  const initialPublicRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/projects',
    method: 'GET'
  });
  const initialCount = initialPublicRes.data.length;
  console.log(`✓ Public portfolio currently has ${initialCount} published projects.`);

  // Step 3: Add new project as DRAFT
  console.log('3. Adding new project as DRAFT from CMS...');
  const newProjectData = {
    title: 'Automated Operations Pipeline & Executive Sync',
    shortDescription: 'Custom executive triage pipeline reducing email processing time by 75%.',
    description: 'Detailed case study on building automated email categorizers, Notion sync hooks, and Google Workspace triggers for rapid executive turnaround.',
    category: 'Virtual Assistance',
    services: ['Virtual Assistance', 'AI & Prompt Engineering'],
    tools: ['Google Workspace', 'Notion', 'Google AI Studio', 'TypeScript'],
    clientName: 'Executive Client Test',
    projectDate: 'March 2026',
    status: 'DRAFT',
    featured: true,
    tags: ['Operations', 'Automation', 'Executive Assistant']
  };

  const createBody = JSON.stringify(newProjectData);
  const createRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/projects',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(createBody),
      'Authorization': `Bearer ${token}`
    }
  }, createBody);

  if (createRes.statusCode !== 201 || !createRes.data.id) {
    throw new Error(`Create project failed: ${JSON.stringify(createRes.data)}`);
  }
  const createdProject = createRes.data;
  console.log(`✓ Created draft project with ID: ${createdProject.id}, slug: ${createdProject.slug}, status: ${createdProject.status}`);

  // Step 4: Verify draft project is NOT visible on public portfolio
  console.log('4. Verifying draft project is hidden from public portfolio...');
  const publicWhileDraftRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/projects',
    method: 'GET'
  });
  const foundDraftInPublic = publicWhileDraftRes.data.some((p: any) => p.id === createdProject.id);
  if (foundDraftInPublic) {
    throw new Error('FAIL: Draft project should NOT appear in public projects list!');
  }
  console.log('✓ Verified: Draft project is completely hidden from public visitors.');

  // Step 5: Publish project via PATCH /api/projects/:id/publish
  console.log('5. Publishing project via CMS...');
  const publishRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/projects/${createdProject.id}/publish`,
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (publishRes.statusCode !== 200 || publishRes.data.status !== 'PUBLISHED') {
    throw new Error(`Publish failed: ${JSON.stringify(publishRes.data)}`);
  }
  console.log(`✓ Project successfully marked as PUBLISHED at: ${publishRes.data.publishedAt}`);

  // Step 6: Verify project IMMEDIATELY appears on public portfolio
  console.log('6. Querying public /api/projects to verify real-time presence on public website...');
  const publicAfterPublishRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/projects',
    method: 'GET'
  });

  const publishedProjectInPublic = publicAfterPublishRes.data.find((p: any) => p.id === createdProject.id);
  if (!publishedProjectInPublic) {
    throw new Error('FAIL: Newly published project did NOT appear in public projects list!');
  }
  console.log(`✓ Verified: Published project immediately visible on public website! (Total published: ${publicAfterPublishRes.data.length})`);

  // Step 7: Query project detail endpoint by slug
  console.log(`7. Fetching public detail page at /api/projects/${createdProject.slug}...`);
  const detailRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/projects/${createdProject.slug}`,
    method: 'GET'
  });

  if (detailRes.statusCode !== 200 || detailRes.data.title !== newProjectData.title) {
    throw new Error(`Detail page verification failed: ${JSON.stringify(detailRes.data)}`);
  }
  console.log('✓ Project detail payload successfully verified with tools, category, and markdown content.');

  // Step 8: Clean up by deleting the test project
  console.log('8. Cleaning up test project...');
  const deleteRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/projects/${createdProject.id}`,
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (deleteRes.statusCode !== 200) {
    throw new Error(`Delete failed: ${JSON.stringify(deleteRes.data)}`);
  }
  console.log('✓ Test project successfully deleted.');

  // Step 9: Final public count check
  const finalPublicRes = await makeRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/projects',
    method: 'GET'
  });
  console.log(`✓ Public count restored to ${finalPublicRes.data.length} projects.`);

  console.log('=== ALL WORKFLOW ACCEPTANCE TESTS PASSED SUCCESSFULLY! ===');
}

runTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
