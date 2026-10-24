import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { AddressInfo } from 'node:net';
import { readFile } from 'node:fs/promises';

async function runWeatherApiTests() {
  process.env.VERCEL = '1';

  const [{ default: app }, { db }, { fetchWeather }, vercelConfigText] = await Promise.all([
    import('../api/index.ts'),
    import('../server/db/database.ts'),
    import('../src/services/api.ts'),
    readFile(new URL('../vercel.json', import.meta.url), 'utf-8'),
  ]);
  const vercelConfig = JSON.parse(vercelConfigText);
  assert.equal(vercelConfig.rewrites[0].source, '/api/:path*');
  assert.equal(vercelConfig.rewrites[0].destination, '/api/index?__route=:path*');
  const server = createServer(app);
  const originalFetch = globalThis.fetch;
  const originalSaveRefreshRun = db.saveRefreshRun;
  let upstreamStatus = 200;
  const providerRequests: string[] = [];

  db.saveRefreshRun = (run) => run;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (!url.startsWith('https://api.open-meteo.com/') && !url.startsWith('https://air-quality-api.open-meteo.com/')) {
      return originalFetch(input, init);
    }

    providerRequests.push(url);
    if (url.startsWith('https://api.open-meteo.com/') && upstreamStatus !== 200) {
      return new Response('Upstream unavailable', { status: upstreamStatus });
    }
    if (url.startsWith('https://air-quality-api.open-meteo.com/')) {
      return new Response('{}', { status: 503 });
    }

    return Response.json({
      timezone: 'UTC',
      current: {
        time: '2026-10-24T12:00',
        temperature_2m: 25,
        relative_humidity_2m: 60,
        apparent_temperature: 26,
        precipitation: 0,
        weather_code: 1,
        wind_speed_10m: 10,
        surface_pressure: 1013,
      },
      current_units: {},
      hourly: {
        time: ['2026-10-24T12:00'],
        temperature_2m: [25],
        precipitation_probability: [0],
        precipitation: [0],
        wind_speed_10m: [10],
      },
      daily: {
        time: ['2026-10-24'],
        temperature_2m_max: [27],
        temperature_2m_min: [20],
        precipitation_sum: [0],
        uv_index_max: [5],
        weather_code: [1],
      },
    });
  };

  try {
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address() as AddressInfo;
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const response = await originalFetch(
      `${baseUrl}/api/index?__route=v1%2Fweather&lat=0&lon=0&location=Null%20Island`
    );
    assert.equal(response.status, 200, 'Vercel rewrite reaches the existing weather endpoint');
    const weather = await response.json();
    assert.equal(weather.location.label, 'Null Island', 'The rewritten request preserves query parameters');
    assert.equal(weather.location.latitude, 0, 'Valid zero latitude is preserved');
    assert.equal(weather.location.longitude, 0, 'Valid zero longitude is preserved');
    assert.equal(providerRequests.length, 2, 'Weather and optional air-quality providers are queried');
    assert.match(providerRequests[0], /latitude=0&longitude=0/, 'Selected coordinates reach Open-Meteo');
    console.log('  PASS: Vercel API rewrite routes weather requests to Open-Meteo');

    providerRequests.length = 0;
    const invalidResponse = await originalFetch(
      `${baseUrl}/api/index?__route=v1%2Fweather&lat=91&lon=0`
    );
    assert.equal(invalidResponse.status, 400, 'Invalid coordinates are rejected before provider requests');
    assert.equal(providerRequests.length, 0, 'Invalid coordinates do not call external providers');
    console.log('  PASS: Invalid coordinates return a clear client error');

    upstreamStatus = 404;
    providerRequests.length = 0;
    const failedResponse = await originalFetch(
      `${baseUrl}/api/index?__route=v1%2Fweather&lat=13.0827&lon=80.2707`
    );
    const failure = await failedResponse.json();
    assert.equal(failedResponse.status, 502, 'Provider errors are reported as gateway errors, not route 404s');
    assert.equal(failure.error.code, 'UPSTREAM_UNAVAILABLE');
    assert.match(failure.error.message, /Open-Meteo weather API returned HTTP 404/);
    console.log('  PASS: Open-Meteo HTTP errors produce a clear, actionable API response');

    globalThis.fetch = async () => new Response('<html>Not found</html>', {
      status: 404,
      headers: { 'content-type': 'text/html' },
    });
    await assert.rejects(
      fetchWeather(13.0827, 80.2707, 'Chennai'),
      /Vercel routing configuration are deployed/
    );
    console.log('  PASS: Frontend reports an actionable message for an HTML deployment 404');
  } finally {
    globalThis.fetch = originalFetch;
    db.saveRefreshRun = originalSaveRefreshRun;
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

runWeatherApiTests().catch((error) => {
  console.error('Weather API tests failed:', error);
  process.exitCode = 1;
});
