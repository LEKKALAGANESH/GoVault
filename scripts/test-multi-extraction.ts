#!/usr/bin/env npx tsx

/**
 * Test script to verify multi-extraction for comprehensive itineraries
 * Run with: npx tsx scripts/test-multi-extraction.ts
 */

const TEST_ITINERARY = `
**10-Day Sri Lanka Itinerary**

**Day 1: Arrival in Colombo**
- Morning: Arrive at Bandaranaike International Airport
- 10:00 AM: Transfer to hotel
- 2:00 PM: Check-in at Cinnamon Grand Colombo
- 4:00 PM: Visit Gangaramaya Temple
- 7:00 PM: Dinner at Ministry of Crab

**Day 2: Colombo to Kandy**
- 8:00 AM: Breakfast at hotel
- 9:00 AM: Drive to Kandy (4 hours)
- 1:00 PM: Lunch in Kandy
- 3:00 PM: Visit Temple of the Tooth Relic
- 6:00 PM: Check-in at Earl's Regency
- 8:00 PM: Dinner and Kandyan dance performance

**Day 3: Kandy Exploration**
- 9:00 AM: Royal Botanical Gardens
- 12:00 PM: Lunch
- 2:00 PM: Tea factory visit
- 5:00 PM: Free time in Kandy

**Packing List:**
- Clothing: Light cotton clothes, Rain jacket, Comfortable walking shoes
- Toiletries: Sunscreen, Insect repellent, Hand sanitizer
- Electronics: Camera, Power bank, Universal adapter
- Documents: Passport, Visa, Travel insurance
- Health & Safety: First aid kit, Prescription medications
- Beach/Temple: Sarong/modest clothing, Hat, Sunglasses

**Useful Sinhala Phrases:**
- Hello - "Ayubowan" (ah-yu-boh-wan)
- Thank you - "Istuti" (is-too-ti)
- Yes - "Ow" (ow)
- No - "Naha" (na-haa)
- How much? - "Kiyada?" (ki-ya-da)
- Delicious - "Rasa-yi" (ra-sa-yi)
- Goodbye - "Gihin ennam" (gi-hin en-nam)
`;

async function testMultiExtraction() {
  // Need to get a valid trip ID and auth token
  // For now, we'll just check if the regex patterns work

  const text = TEST_ITINERARY;

  // Check what content types exist
  const hasDayContent = /day\s*[1-9]|day\s*one|first\s*day|morning|afternoon|evening/i.test(text);
  const hasPackingContent = /packing\s*list|what\s*to\s*(pack|bring)|essentials|luggage/i.test(text);
  const hasPhrasesContent = /phrases|language|how\s*to\s*say|useful\s*words|local\s*expressions|sinhala|thai/i.test(text);

  console.log("Content Detection Results:");
  console.log("========================");
  console.log(`Has Day Content: ${hasDayContent}`);
  console.log(`Has Packing Content: ${hasPackingContent}`);
  console.log(`Has Phrases Content: ${hasPhrasesContent}`);

  if (hasDayContent && hasPackingContent && hasPhrasesContent) {
    console.log("\n✅ All three content types detected - multi-extraction should trigger");
  } else {
    console.log("\n⚠️ Some content types not detected:");
    if (!hasDayContent) console.log("  - Day content NOT detected");
    if (!hasPackingContent) console.log("  - Packing content NOT detected");
    if (!hasPhrasesContent) console.log("  - Phrases content NOT detected");
  }
}

testMultiExtraction();
