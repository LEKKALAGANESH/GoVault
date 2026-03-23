/**
 * Run this script in your browser console while logged in to capture auth state.
 *
 * Instructions:
 * 1. Open http://localhost:3000/trips in your browser
 * 2. Make sure you're logged in
 * 3. Open browser DevTools (F12)
 * 4. Go to Console tab
 * 5. Paste this entire script and press Enter
 * 6. Copy the JSON output
 * 7. Save it to .auth/user.json in your project
 */

(function captureAuthState() {
  const state = {
    cookies: [],
    origins: [
      {
        origin: window.location.origin,
        localStorage: [],
      },
    ],
  };

  // Capture cookies
  document.cookie.split(';').forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      state.cookies.push({
        name,
        value,
        domain: window.location.hostname,
        path: '/',
        expires: -1,
        httpOnly: false,
        secure: window.location.protocol === 'https:',
        sameSite: 'Lax',
      });
    }
  });

  // Capture localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      state.origins[0].localStorage.push({
        name: key,
        value: localStorage.getItem(key),
      });
    }
  }

  // Output as JSON
  const json = JSON.stringify(state, null, 2);

  console.log('=== AUTH STATE (copy everything below) ===');
  console.log(json);
  console.log('=== END AUTH STATE ===');

  // Also try to copy to clipboard
  try {
    navigator.clipboard.writeText(json).then(() => {
      console.log('✅ Copied to clipboard! Paste into .auth/user.json');
    });
  } catch (e) {
    console.log('Could not copy to clipboard. Please copy the JSON manually.');
  }

  return json;
})();
