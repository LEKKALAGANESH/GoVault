/**
 * Test script to verify IDOR vulnerability fix
 * Run with: npx tsx scripts/test-idor-fix.ts
 */

const BASE_URL = "http://localhost:3000";

// Your auth cookie value (split across two cookies)
const AUTH_COOKIE_0 = `sb-stkntatsxmlhyilmukni-auth-token.0=base64-eyJhY2Nlc3NfdG9rZW4iOiJleUpoYkdjaU9pSkZVekkxTmlJc0ltdHBaQ0k2SWpWbFpqRXdNbVF5TFdObVpqZ3ROR015TmkwNU1UY3dMV0UyT1dJNE5HWmxZelJqTlNJc0luUjVjQ0k2SWtwWFZDSjkuZXlKcGMzTWlPaUpvZEhSd2N6b3ZMM04wYTI1MFlYUnplRzFzYUhscGJHMTFhMjVwTG5OMWNHRmlZWE5sTG1OdkwyRjFkR2d2ZGpFaUxDSnpkV0lpT2lKaFptTTNZbVE1TkMwMU1UZzNMVFEzWXpFdFlqRTRNeTFsWkRobU16Qmhaak5sWlRjaUxDSmhkV1FpT2lKaGRYUm9aVzUwYVdOaGRHVmtJaXdpWlhod0lqb3hOelk1TVRrd01UVXdMQ0pwWVhRaU9qRTNOamt4T0RZMU5UQXNJbVZ0WVdsc0lqb2ljSEpoYTJoaGNrQmlkV2xzWkhSbGJuZ3VZV2tpTENKd2FHOXVaU0k2SWlJc0ltRndjRjl0WlhSaFpHRjBZU0k2ZXlKd2NtOTJhV1JsY2lJNkltZHZiMmRzWlNJc0luQnliM1pwWkdWeWN5STZXeUpuYjI5bmJHVWlYWDBzSW5WelpYSmZiV1YwWVdSaGRHRWlPbnNpWVhaaGRHRnlYM1Z5YkNJNkltaDBkSEJ6T2k4dmJHZ3pMbWR2YjJkc1pYVnpaWEpqYjI1MFpXNTBMbU52YlM5aEwwRkRaemh2WTB0cmVVVjBRMVZqTXpOdlgwczVVMVpVWkdOU1dqSkRZMjFpVVRjeVEzSlBXRnBHWDFod2RtZHJZMnhhYlc5RlFUMXpPVFl0WXlJc0ltTjFjM1J2YlY5amJHRnBiWE1pT25zaWFHUWlPaUppZFdsc1pIUmxibmd1WVdraWZTd2laVzFoYVd3aU9pSndjbUZyYUdGeVFHSjFhV3hrZEdWdWVDNWhhU0lzSW1WdFlXbHNYM1psY21sbWFXVmtJanAwY25WbExDSm1kV3hzWDI1aGJXVWlPaUpRY21GcmFHRnlJRWR2ZVdGc0lpd2lhWE56SWpvaWFIUjBjSE02THk5aFkyTnZkVzUwY3k1bmIyOW5iR1V1WTI5dElpd2libUZ0WlNJNklsQnlZV3RvWVhJZ1IyOTVZV3dpTENKd2FHOXVaVjkyWlhKcFptbGxaQ0k2Wm1Gc2MyVXNJbkJwWTNSMWNtVWlPaUpvZEhSd2N6b3ZMMnhvTXk1bmIyOW5iR1YxYzJWeVkyOXVkR1Z1ZEM1amIyMHZZUzlCUTJjNGIyTkxhM2xGZEVOVll6TXpiMTlMT1ZOV1ZHUmpVbG95UTJOdFlsRTNNa055VDFoYVJsOVljSFpuYTJOc1dtMXZSVUU5Y3prMkxXTWlMQ0p3Y205MmFXUmxjbDlwWkNJNklqRXhNVGswTVRVMU56YzJOamMxTnpjek9UazFNeUlzSW5OMVlpSTZJakV4TVRrME1UVTFOemMyTmpjMU56Y3pPVGsxTXlKOUxDSnliMnhsSWpvaVlYVjBhR1Z1ZEdsallYUmxaQ0lzSW1GaGJDSTZJbUZoYkRFaUxDSmhiWElpT2x0N0ltMWxkR2h2WkNJNkltOWhkWFJvSWl3aWRHbHRaWE4wWVcxd0lqb3hOelk1TVRnMk5UVXdmVjBzSW5ObGMzTnBiMjVmYVdRaU9pSm1PRGt4TXpreE5DMWhNamxsTFRSbU1ETXRPVEE0WVMwNFlXWmhZMlE1TkRjMk56a2lMQ0pwYzE5aGJtOXVlVzF2ZFhNaU9tWmhiSE5sZlEuZHNiNllfTUpnVlRLYjZaY3diUUstV1V4ZUo3TDlSX0R3VW01UG1UYzhsdlNCWlVtTWFGbmI3bDFrV1ZlUGJjMFFHcDVVOUxGX3ZiWU1jRkhWRmlSR2ciLCJ0b2tlbl90eXBlIjoiYmVhcmVyIiwiZXhwaXJlc19pbiI6MzYwMCwiZXhwaXJlc19hdCI6MTc2OTE5MDE1MCwicmVmcmVzaF90b2tlbiI6ImFkcWVlZWVkd200YyIsInVzZXIiOnsiaWQiOiJhZmM3YmQ5NC01MTg3LTQ3YzEtYjE4My1lZDhmMzBhZjNlZTciLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJlbWFpbCI6InByYWtoYXJAYnVpbGR0ZW54LmFpIiwiZW1haWxfY29uZmlybWVkX2F0IjoiMjAyNi0wMS0xNlQwMzozMjoxNC4xNzY4NjVaIiwicGhvbmUiOiIiLCJjb25maXJtZWRfYXQiOiIyMDI2LTAxLTE2VDAzOjMyOjE0LjE3Njg2NVoiLCJsYXN0X3NpZ25faW5fYXQiOiIyMDI2LTAxLTIzVDE2OjQyOjMwLjAyNDA5NDAxWiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6Imdvb2dsZSIsInByb3ZpZGVycyI6WyJnb29nbGUiXX0sInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0treUV0Q1VjMzNvX0s5U1ZUZGNSWjJDY21iUTcyQ3JPWFpGX1hwdmdrY2xabW9FQT1zOTYtYyIsImN1c3RvbV9jbGFpbXMiOnsiaGQiOiJidWlsZHRlbnguYWkifSwiZW1haWwiOiJwcmFraGFyQGJ1aWxkdGVueC5haSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJQcmFraGFyIEdveWFsIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibmFtZSI6IlByYWtoYXIgR295YWwiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLa3lFdENVYzMzb19LOVNWVGRjUloyQ2NtYlE3MkNyT1haRl9YcHZna2NsWm1vRUE9czk2LWMiLCJwcm92aWRlcl9pZCI6IjExMTk0MTU1Nzc2Njc1NzczOTk1MyIsInN1YiI6IjExMTk0MTU1Nzc2Njc1Nw`;
const AUTH_COOKIE_1 = `sb-stkntatsxmlhyilmukni-auth-token.1=zczOTk1MyJ9LCJpZGVudGl0aWVzIjpbeyJpZGVudGl0eV9pZCI6Ijc5OWIwMDc2LTMxODAtNDhjNi1hODI2LWE1MjlhZmE5ZGZhMCIsImlkIjoiMTExOTQxNTU3NzY2NzU3NzM5OTUzIiwidXNlcl9pZCI6ImFmYzdiZDk0LTUxODctNDdjMS1iMTgzLWVkOGYzMGFmM2VlNyIsImlkZW50aXR5X2RhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0treUV0Q1VjMzNvX0s5U1ZUZGNSWjJDY21iUTcyQ3JPWFpGX1hwdmdrY2xabW9FQT1zOTYtYyIsImN1c3RvbV9jbGFpbXMiOnsiaGQiOiJidWlsZHRlbnguYWkifSwiZW1haWwiOiJwcmFraGFyQGJ1aWxkdGVueC5haSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJQcmFraGFyIEdveWFsIiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb29nbGUuY29tIiwibmFtZSI6IlByYWtoYXIgR295YWwiLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLa3lFdENVYzMzb19LOVNWVGRjUloyQ2NtYlE3MkNyT1haRl9YcHZna2NsWm1vRUE9czk2LWMiLCJwcm92aWRlcl9pZCI6IjExMTk0MTU1Nzc2Njc1NzczOTk1MyIsInN1YiI6IjExMTk0MTU1Nzc2Njc1NzczOTk1MyJ9LCJwcm92aWRlciI6Imdvb2dsZSIsImxhc3Rfc2lnbl9pbl9hdCI6IjIwMjYtMDEtMTZUMDM6MzI6MTQuMTY0NDIzWiIsImNyZWF0ZWRfYXQiOiIyMDI2LTAxLTE2VDAzOjMyOjE0LjE2NTEwOVoiLCJ1cGRhdGVkX2F0IjoiMjAyNi0wMS0yM1QxNjo0MjoyOS42MzA4MzNaIiwiZW1haWwiOiJwcmFraGFyQGJ1aWxkdGVueC5haSJ9XSwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMTZUMDM6MzI6MTQuMTM2NzUxWiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAxLTIzVDE2OjQyOjMwLjA2OTAzOFoiLCJpc19hbm9ueW1vdXMiOmZhbHNlfSwicHJvdmlkZXJfdG9rZW4iOiJ5YTI5LkEwQVVNV2dfSnVTOTd0RzBWTUJhN0t4Wk9BTXZ2aEZnRlk2WlF4YkJ0MWc1MmtVaVJPSjhWNVVwRWt4OHJBS3pSQzFqVmgyb1pBRGcwOXp5R2VhaWRfbjJWd28xN01BN1otYzZ5MFpnRloxeFBpdWJnS2l2RWx4OTk5R21nd2F2XzNfYlhsY3hZRE1oVEIwd3lGS1JZaHdxMVRaMG95eTdXTjBaU0xaZlRDTVUyTFVRNXU1empHdUhETTZiYk0tMGtpTHRYTFRRWHc5WmRvdkYzTW8wUk5xT09TaG1HVkw4UEdFdkZ3cm9tTUhoT19qWktrRWY4OHJRXzc5cFNxOEtDMG9xa3RrVV9NdHhIVEFhWXV1S3ZfeUhwa2ZZSWFDZ1lLQWRVU0FSWVNGUUhHWDJNaWpTSjdPMHVja2FscHVVMnVKdGFwRVEwMjkwIn0`;
const AUTH_COOKIE = `${AUTH_COOKIE_0}; ${AUTH_COOKIE_1}`;

// Your user ID from the token
const MY_USER_ID = "afc7bd94-5187-47c1-b183-ed8f30af3ee7";

// A random UUID that doesn't exist (to test non-existent trip)
const FAKE_TRIP_ID = "00000000-0000-0000-0000-000000000001";

async function testEndpoint(
  name: string,
  url: string,
  expectedStatus: number,
  description: string
) {
  try {
    const response = await fetch(url, {
      headers: {
        Cookie: AUTH_COOKIE,
        "Content-Type": "application/json",
      },
    });

    const status = response.status;
    const body = await response.json().catch(() => ({}));
    const passed = status === expectedStatus;

    console.log(`\n${passed ? "✅" : "❌"} ${name}`);
    console.log(`   ${description}`);
    console.log(`   Expected: ${expectedStatus}, Got: ${status}`);
    if (!passed) {
      console.log(`   Response: ${JSON.stringify(body)}`);
    }

    return passed;
  } catch (error) {
    console.log(`\n❌ ${name}`);
    console.log(`   Error: ${error}`);
    return false;
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("IDOR Vulnerability Fix Test");
  console.log("=".repeat(60));
  console.log(`\nUser ID: ${MY_USER_ID}`);

  // First, let's get a list of trips to find one we own
  console.log("\n📋 Fetching trips to find test data...");

  const tripsResponse = await fetch(`${BASE_URL}/api/trip-id`, {
    headers: {
      Cookie: AUTH_COOKIE,
    },
  });

  if (!tripsResponse.ok) {
    console.log("❌ Could not fetch trips. Is the dev server running?");
    console.log(`   Status: ${tripsResponse.status}`);
    return;
  }

  const tripsData = await tripsResponse.json();
  const myTripId = tripsData.tripId;

  if (!myTripId) {
    console.log("❌ No trips found for this user");
    return;
  }

  console.log(`✅ Found trip: ${myTripId}`);

  let passed = 0;
  let failed = 0;

  // Test 1: Access own trip's bookings (should work)
  if (
    await testEndpoint(
      "GET own trip bookings",
      `${BASE_URL}/api/trips/${myTripId}/bookings`,
      200,
      "Should return 200 for own trip"
    )
  ) {
    passed++;
  } else {
    failed++;
  }

  // Test 2: Access own trip's todos (should work)
  if (
    await testEndpoint(
      "GET own trip todos",
      `${BASE_URL}/api/trips/${myTripId}/todos`,
      200,
      "Should return 200 for own trip"
    )
  ) {
    passed++;
  } else {
    failed++;
  }

  // Test 3: Access own trip's documents (should work)
  if (
    await testEndpoint(
      "GET own trip documents",
      `${BASE_URL}/api/trips/${myTripId}/documents`,
      200,
      "Should return 200 for own trip"
    )
  ) {
    passed++;
  } else {
    failed++;
  }

  // Test 4: Access non-existent trip's bookings (should return 404)
  if (
    await testEndpoint(
      "GET non-existent trip bookings",
      `${BASE_URL}/api/trips/${FAKE_TRIP_ID}/bookings`,
      404,
      "Should return 404 for non-existent trip"
    )
  ) {
    passed++;
  } else {
    failed++;
  }

  // Test 5: Access non-existent trip's todos (should return 404)
  if (
    await testEndpoint(
      "GET non-existent trip todos",
      `${BASE_URL}/api/trips/${FAKE_TRIP_ID}/todos`,
      404,
      "Should return 404 for non-existent trip"
    )
  ) {
    passed++;
  } else {
    failed++;
  }

  // Test 6: Access non-existent trip's documents (should return 404)
  if (
    await testEndpoint(
      "GET non-existent trip documents",
      `${BASE_URL}/api/trips/${FAKE_TRIP_ID}/documents`,
      404,
      "Should return 404 for non-existent trip"
    )
  ) {
    passed++;
  } else {
    failed++;
  }

  console.log("\n" + "=".repeat(60));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log("=".repeat(60));

  if (failed === 0) {
    console.log("\n🎉 All IDOR tests passed! The fix is working correctly.");
  } else {
    console.log("\n⚠️  Some tests failed. Please review the results above.");
  }

  console.log("\n📝 Note: To fully test IDOR, you need a second user's trip ID.");
  console.log("   If you have one, update FAKE_TRIP_ID with a real trip ID");
  console.log("   that belongs to another user - it should return 403.");
}

main().catch(console.error);
