#!/usr/bin/env npx tsx

/**
 * Test the multi-extraction API directly
 * This requires authentication - we'll use the stored auth state
 *
 * Run with: npx tsx scripts/test-api-multi-extract.ts
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const TEST_ITINERARY = `
Here is a curated 4-Day South Coast "Gourmet & Chill" Itinerary for February 23rd.
The Logistics
Dates: Feb 23rd - Feb 26th
Route: Airport → Mirissa/Galle Area (Base Camp) → Udawalawe (Day Trip) → Airport.
Transport: Rent a Private Van with a Driver. For 4 people + luggage, this is cheaper and far more comfortable than trains or taxis. Cost is approx. 60-80 USD per day split by 4.

Day 1: Arrival & The Golden Hour (Feb 23)
Morning/Afternoon: Land at CMB Airport. Meet your driver and head straight to the South Coast via the Expressway (approx. 2.5 - 3 hours).
Check-in: Stay in Talpe or Unawatuna. These areas are cleaner and quieter than the main Unawatuna strip but very close to the action.
Mid-Range Hotel Suggestion: Bedspace Beach (Unawatuna) or Owl and the Pussycat (boutique, slightly pricier but great for groups).
16:00 - 18:00: Dalawella Beach (Wijaya Beach). This is famous for the "rope swing" photos, but for you, it's about the natural rock pool. You can swim calmly with sea turtles that come right up to the shore.
19:30: Dinner at Wijaya Beach Restaurant. Their wood-fired pizza and calamari are legendary. It's right on the sand.

Day 2: Culture, Coffee & Curries (Feb 24)
09:30 - 11:30: Slow Breakfast. Enjoy a traditional Sri Lankan breakfast (String Hoppers, Dhal, Coconut Sambol) at your hotel.
13:00 - 16:00: Galle Fort Exploration. This is a UNESCO site and the food capital of the south.
Walk the ramparts (fort walls).
Lunch/Snack: Poonie's Kitchen (hidden gem, great salad thalis) or Pedlar's Inn for coffee/gelato.
16:30 - 19:30: Private Cooking Class. Since you love food, book a private group class near Galle.
Recommendation: Sanju's Cooking Class or Wasantha's Pol Roti Shop. You will go to the market, buy veggies, cook 5-7 curries together, and then eat them for dinner.
20:00: Drinks at The Merchant or Botanik in Galle Fort for a classy vibe before heading back.

Day 3: The Jungle Run (Feb 25)
11:00: Sleep in! Enjoy the beach or pool in the morning.
12:30: Depart for Udawalawe National Park (approx. 2 hours drive).
Why Udawalawe over Yala? It is closer to your base, less crowded, and you are 100% guaranteed to see wild elephants close up. Yala is often too crowded with jeeps.
14:30: Visit the Elephant Transit Home (feeding time is usually 14:30 or 15:00). You can watch baby elephants being fed milk from a viewing platform.
15:00 - 18:00: Private Jeep Safari. The "golden hour" right before sunset is when animals are most active. You will see herds of elephants, peacocks, buffalo, and crocodiles.
20:30: Late Dinner back in Mirissa at The Doctor's House (great vibe, live music, garden setting).

Day 4: The Final Dip (Feb 26)
08:00 - 10:00: Morning swim at Secret Beach, Mirissa. It's a bit of a hike/tuk-tuk ride to get there, but it's secluded and beautiful.
11:00: Check out.
12:00: Stop for lunch at Zephyr in Mirissa (great burgers and cocktails) before the drive back.
13:30: Depart for Airport (Allow 3 hours to be safe).

3. Packing List (Essentials):
Mosquito Repellent: (Crucial for the safari and evenings).
Sunscreen & Hat: The sun is intense.
Loose Cotton/Linen Clothes: It is hot and humid.
White Outfit: If you plan to visit any temples, you must cover shoulders and knees, and white is the traditional color (though not mandatory, it's respectful).
Slip-on Sandals: You take shoes off constantly (hotels, temples, some shops).

Language Suggestions (Sinhala)
Sri Lankans speak excellent English, but these phrases will get you big smiles:
Ayubowan (Ay-yu-bo-wan) = Hello / May you live long (Formal greeting).
Istuti (Iss-too-thi) = Thank you.
Hari Hari (Hah-ree Hah-ree) = Okay / All good (You will hear drivers say this 100 times a day).
Lassanai (Lass-an-eye) = Beautiful.
Rasai (Ra-sigh) = Delicious (Use this at the cooking class!).
Kiyada? (Key-a-da?) = How much?
`;

async function main() {
  // Check if auth state exists
  const authPath = '.auth/user.json';
  if (!fs.existsSync(authPath)) {
    console.error('❌ Auth state not found. Run: npx playwright test auth.setup --headed');
    process.exit(1);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    storageState: authPath,
    baseURL: 'http://localhost:3000',
  });

  try {
    // First, get an existing trip or create one
    const page = await context.newPage();
    await page.goto('/trips');
    await page.waitForLoadState('networkidle');

    // Check if we're logged in - wait for redirect to complete
    await page.waitForTimeout(2000);
    console.log(`Current URL: ${page.url()}`);
    if (page.url().includes('/login')) {
      console.error('❌ Not logged in. Run: npx playwright test auth.setup --headed');
      await browser.close();
      process.exit(1);
    }

    // Get the first trip link
    const tripLink = page.locator('a[href^="/trips/"]').first();
    const tripHref = await tripLink.getAttribute('href');

    if (!tripHref) {
      console.error('❌ No trips found. Create a trip first.');
      await browser.close();
      process.exit(1);
    }

    // Extract trip slug
    const tripSlug = tripHref.replace('/trips/', '');
    console.log(`Using trip: ${tripSlug}`);

    // Make API request
    const request = context.request;

    console.log('\n📤 Sending PARSE_ITINERARY request...\n');

    const response = await request.post(`/api/trips/${tripSlug}/agent`, {
      data: {
        action: 'PARSE_ITINERARY',
        tripId: tripSlug,
        text: TEST_ITINERARY,
      },
    });

    if (!response.ok()) {
      console.error(`❌ API Error: ${response.status()} ${response.statusText()}`);
      const body = await response.text();
      console.error(body);
      await browser.close();
      process.exit(1);
    }

    const data = await response.json();

    console.log('📥 Response received!\n');
    console.log('='.repeat(60));
    console.log('PROPOSED CHANGES:');
    console.log('='.repeat(60));

    if (data.proposedChanges && data.proposedChanges.length > 0) {
      const toolsUsed = data.proposedChanges.map((c: { tool: string }) => c.tool);
      const uniqueTools = [...new Set(toolsUsed)];

      console.log(`\nTools called: ${uniqueTools.join(', ')}`);
      console.log(`Total changes: ${data.proposedChanges.length}\n`);

      // Check which tools were called
      const hasItinerary = toolsUsed.includes('parse_itinerary_text');
      const hasPacking = toolsUsed.includes('generate_packing_list');
      const hasPhrases = toolsUsed.includes('generate_phrases');

      console.log('Extraction Results:');
      console.log(`  ${hasItinerary ? '✅' : '❌'} parse_itinerary_text (days/activities)`);
      console.log(`  ${hasPacking ? '✅' : '❌'} generate_packing_list`);
      console.log(`  ${hasPhrases ? '✅' : '❌'} generate_phrases`);

      if (hasItinerary && hasPacking && hasPhrases) {
        console.log('\n🎉 SUCCESS! All three content types were extracted!');
      } else {
        console.log('\n⚠️  Some extractions are missing. Check server logs for details.');
      }

      // Show details
      console.log('\n' + '-'.repeat(60));
      console.log('DETAILS:');
      console.log('-'.repeat(60));

      for (const change of data.proposedChanges) {
        console.log(`\n[${change.tool}]`);
        console.log(`  Description: ${change.description?.substring(0, 100)}...`);
      }
    } else {
      console.log('❌ No proposed changes returned!');
      console.log('\nFull response:');
      console.log(JSON.stringify(data, null, 2));
    }

    if (data.suggestions && data.suggestions.length > 0) {
      console.log('\n' + '-'.repeat(60));
      console.log('SUGGESTIONS:');
      console.log('-'.repeat(60));
      for (const suggestion of data.suggestions) {
        console.log(`  - ${suggestion.title}: ${suggestion.description}`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

main();
