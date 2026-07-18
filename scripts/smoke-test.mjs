import http from 'http';

const targetPort = process.env.PORT || 3000;
const host = 'localhost';

const routesToTest = [
  { path: '/', expectedStatuses: [200] },
  { path: '/sign-in', expectedStatuses: [200] },
  { path: '/sign-up', expectedStatuses: [200] },
  { path: '/privacy', expectedStatuses: [200] },
  { path: '/terms', expectedStatuses: [200] },
  // Dashboard routes usually redirect to login if unauthenticated
  { path: '/dashboard', expectedStatuses: [200, 302, 307] },
  { path: '/dashboard/scan', expectedStatuses: [200, 302, 307] },
  { path: '/dashboard/removal', expectedStatuses: [200, 302, 307] },
  { path: '/dashboard/reports', expectedStatuses: [200, 302, 307] },
  { path: '/dashboard/settings', expectedStatuses: [200, 302, 307] },
  // API Webhook is POST only, so GET should return 405 Method Not Allowed or redirect
  { path: '/api/webhooks/clerk', expectedStatuses: [405, 307, 302, 400] }
];

function testRoute(route) {
  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: targetPort,
      path: route.path,
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      const isOk = route.expectedStatuses.includes(res.statusCode);
      if (isOk) {
        console.log(`✅ [OK] GET ${route.path} - Returned status ${res.statusCode}`);
        resolve(true);
      } else {
        console.error(`❌ [FAIL] GET ${route.path} - Expected one of [${route.expectedStatuses}], got ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.error(`❌ [ERROR] GET ${route.path} failed: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.error(`❌ [TIMEOUT] GET ${route.path} timed out`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function run() {
  console.log(`Starting smoke testing suite on http://${host}:${targetPort}...`);
  let passedCount = 0;
  
  for (const route of routesToTest) {
    const passed = await testRoute(route);
    if (passed) passedCount++;
  }

  const successRate = passedCount / routesToTest.length;
  console.log(`\nSmoke Test Summary: ${passedCount}/${routesToTest.length} routes passed.`);
  
  if (successRate === 1) {
    console.log("🎉 All smoke tests passed successfully!");
    process.exit(0);
  } else {
    console.error("⚠️ Some smoke tests failed. Please inspect logs.");
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Smoke test suite crashed:", err);
  process.exit(1);
});
