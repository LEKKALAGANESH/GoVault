import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plane, MapPin, Receipt, WifiOff, Users, FileText } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="gradient-teal min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="text-center z-10 px-6 max-w-3xl mx-auto">
          {/* Animated emoji */}
          <div className="text-6xl mb-6 animate-bounce">
            <span className="inline-block">✈️</span>
            <span className="inline-block ml-2">🌴</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Go<span className="text-gold">Vault</span>
          </h1>

          {/* Subtitle */}
          <p className="text-gold-light text-xl md:text-2xl mb-2 font-serif">
            Your Smart Travel Companion
          </p>

          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Turn scattered confirmations into a beautiful, organized journey.
            All your bookings, expenses, and memories in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-white text-teal hover:bg-cream px-8 py-6 text-lg font-semibold rounded-full"
              >
                Get Started Free
              </Button>
            </Link>
            <Link href="#features">
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 bg-transparent text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full"
              >
                See How It Works
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <p className="text-white/60 text-sm mt-8">
            No credit card required. Free for your first trip.
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-navy mb-4">
            Everything You Need, <span className="text-teal">All in One Place</span>
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Most travel apps focus on planning. GoVault focuses on execution —
            the journey from &quot;trip booked&quot; to &quot;trip completed.&quot;
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="w-8 h-8" />}
              title="Centralized Booking Vault"
              description="Flights, hotels, activities — everything organized beautifully with all the details you need."
              color="teal"
            />
            <FeatureCard
              icon={<Receipt className="w-8 h-8" />}
              title="Real-Time Expense Tracker"
              description="Snap receipts, log expenses in any currency. Know exactly what you're spending."
              color="gold"
            />
            <FeatureCard
              icon={<WifiOff className="w-8 h-8" />}
              title="Fully Offline-Ready"
              description="No internet at the temple? No problem. Everything works offline when you need it most."
              color="coral"
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Share with Travel Companions"
              description="Co-plan with your partner, share the read-only view with parents. Privacy controls built-in."
              color="teal"
            />
            <FeatureCard
              icon={<MapPin className="w-8 h-8" />}
              title="Day-by-Day Trip Planner"
              description="Beautiful timeline view with energy levels, tips, and restaurant suggestions."
              color="gold"
            />
            <FeatureCard
              icon={<Plane className="w-8 h-8" />}
              title="AI-Powered Smart Import"
              description="Forward your booking emails, snap receipts — AI extracts everything automatically."
              color="coral"
            />
          </div>
        </div>
      </section>

      {/* Made for Families Section */}
      <section className="py-20 px-6 bg-sand">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            Built for <span className="text-coral">Family</span> Travel
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Traveling with a toddler? Elderly parents? GoVault understands.
            Add traveler profiles and get suggestions that work for everyone.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <TravelerBadge emoji="👨" name="You" />
            <TravelerBadge emoji="👩" name="Partner" />
            <TravelerBadge emoji="👵" name="Mom (67)" />
            <TravelerBadge emoji="👶" name="Baby (20mo)" />
          </div>

          <p className="text-sm text-muted-foreground italic">
            &quot;Drop at top parking (no stairs for Mom)&quot; •
            &quot;Stroller-friendly walkways&quot; •
            &quot;Nap time is sacred!&quot;
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 gradient-teal">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Organize Your Next Trip in Minutes
          </h2>
          <p className="text-white/80 mb-8">
            Get started for free — no credit card needed.
          </p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-white text-teal hover:bg-cream px-10 py-6 text-lg font-semibold rounded-full"
            >
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-navy text-center">
        <p className="text-gold font-serif text-xl mb-2">GoVault</p>
        <p className="text-white/60 text-sm">
          Made with ❤️ for travelers who want to travel, not organize.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'teal' | 'gold' | 'coral';
}) {
  const colorClasses = {
    teal: 'bg-teal/10 text-teal',
    gold: 'bg-gold/10 text-gold',
    coral: 'bg-coral/10 text-coral',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${colorClasses[color]}`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-navy mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function TravelerBadge({ emoji, name }: { emoji: string; name: string }) {
  return (
    <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
      <span className="text-xl">{emoji}</span>
      <span className="text-navy font-medium">{name}</span>
    </div>
  );
}
