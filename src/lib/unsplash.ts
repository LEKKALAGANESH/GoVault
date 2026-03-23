// Unsplash API utility for fetching destination images

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

export interface UnsplashImage {
  id: string;
  url: string;
  thumb: string;
  regular: string;
  full: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
}

interface UnsplashApiResponse {
  results: Array<{
    id: string;
    urls: {
      raw: string;
      full: string;
      regular: string;
      small: string;
      thumb: string;
    };
    alt_description: string | null;
    user: {
      name: string;
      links: {
        html: string;
      };
    };
  }>;
}

// Simple in-memory cache for destination images
const imageCache = new Map<string, { images: UnsplashImage[]; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Varied search terms for different aspects of destinations
const destinationSearchTerms: Record<string, string[]> = {
  phuket: ["phuket beach", "phuket boats", "phuket sunset", "phuket town", "phi phi island"],
  bangkok: ["bangkok street food", "bangkok skyline night", "bangkok floating market", "bangkok tuk tuk", "bangkok temple gold"],
  thailand: ["thailand beach", "thailand food market", "thailand longtail boat", "thailand night market", "thailand islands"],
  japan: ["tokyo shibuya", "kyoto bamboo", "japan cherry blossom", "osaka street", "mount fuji"],
  tokyo: ["tokyo neon", "tokyo street", "tokyo temple", "tokyo food", "tokyo skyline"],
  paris: ["paris eiffel", "paris cafe", "paris street", "paris louvre", "paris seine"],
  italy: ["rome colosseum", "venice canal", "amalfi coast", "tuscany", "italian food"],
  bali: ["bali rice terrace", "bali temple", "bali beach", "bali waterfall", "bali sunset"],
  default: ["travel adventure", "tropical beach", "city skyline", "local market", "scenic landscape"],
};

function getSearchTermsForDestination(destination: string): string[] {
  const lower = destination.toLowerCase();
  for (const [key, terms] of Object.entries(destinationSearchTerms)) {
    if (lower.includes(key)) {
      return terms;
    }
  }
  return destinationSearchTerms.default;
}

export async function getDestinationImages(
  destinations: string[],
  count: number = 3
): Promise<UnsplashImage[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn("UNSPLASH_ACCESS_KEY not set, using fallback");
    return [];
  }

  const cacheKey = destinations.sort().join(",") + `-${count}`;
  const cached = imageCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.images;
  }

  try {
    const images: UnsplashImage[] = [];
    const usedIds = new Set<string>();

    // Get varied search terms for each destination
    for (const destination of destinations.slice(0, 2)) {
      const searchTerms = getSearchTermsForDestination(destination);

      // Use different search terms to get variety
      for (const term of searchTerms.slice(0, Math.ceil(count / 2))) {
        const query = encodeURIComponent(term);
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${query}&per_page=2&orientation=landscape`,
          {
            headers: {
              Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
            },
            next: { revalidate: 3600 },
          }
        );

        if (!response.ok) {
          console.error(`Unsplash API error: ${response.status}`);
          continue;
        }

        const data: UnsplashApiResponse = await response.json();

        for (const photo of data.results) {
          // Avoid duplicates
          if (usedIds.has(photo.id)) continue;
          usedIds.add(photo.id);

          images.push({
            id: photo.id,
            url: photo.urls.regular,
            thumb: photo.urls.thumb,
            regular: photo.urls.regular,
            full: photo.urls.full,
            alt: photo.alt_description || `${destination} travel photo`,
            photographer: photo.user.name,
            photographerUrl: photo.user.links.html,
          });
        }

        // Stop if we have enough images
        if (images.length >= count * destinations.length) break;
      }
    }

    // Cache the results
    imageCache.set(cacheKey, { images, timestamp: Date.now() });

    return images;
  } catch (error) {
    console.error("Error fetching Unsplash images:", error);
    return [];
  }
}

// Fallback gradient backgrounds when Unsplash is not available
export const destinationGradients: Record<string, string> = {
  thailand: "from-emerald-600 via-teal-600 to-cyan-700",
  phuket: "from-cyan-500 via-teal-600 to-emerald-700",
  bangkok: "from-amber-500 via-orange-600 to-red-700",
  japan: "from-pink-400 via-rose-500 to-red-600",
  tokyo: "from-slate-600 via-purple-700 to-indigo-800",
  france: "from-blue-500 via-indigo-600 to-purple-700",
  paris: "from-rose-400 via-pink-500 to-purple-600",
  italy: "from-green-500 via-emerald-600 to-teal-700",
  rome: "from-amber-500 via-orange-600 to-red-700",
  default: "from-teal-600 via-emerald-700 to-cyan-800",
};

export function getDestinationGradient(destinations: string[]): string {
  const searchString = destinations.join(" ").toLowerCase();

  for (const [key, gradient] of Object.entries(destinationGradients)) {
    if (searchString.includes(key)) {
      return gradient;
    }
  }

  return destinationGradients.default;
}
