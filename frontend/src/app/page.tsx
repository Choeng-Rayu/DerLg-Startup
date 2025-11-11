import Link from 'next/link';
import SearchBar from '@/components/ui/SearchBar';
import FeaturedHotels from '@/components/home/FeaturedHotels';
import PopularDestinations from '@/components/home/PopularDestinations';
import Button from '@/components/ui/Button';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Cambodia's Hidden Gems
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Book hotels, tours, and cultural experiences with AI-powered recommendations
            </p>
          </div>
          
          {/* Search Bar with Live Search */}
          <div className="max-w-6xl mx-auto">
            <SearchBar showLiveResults={true} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose DerLg.com?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Recommendations</h3>
              <p className="text-gray-600">
                Get personalized suggestions based on your preferences and travel style
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-2">Flexible Payment Options</h3>
              <p className="text-gray-600">
                Pay deposit, milestone payments, or full amount with special discounts
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🏨</div>
              <h3 className="text-xl font-semibold mb-2">Verified Hotels & Tours</h3>
              <p className="text-gray-600">
                All properties and experiences are verified for quality and authenticity
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <FeaturedHotels />

      {/* Popular Destinations */}
      <PopularDestinations />

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Adventure?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Chat with our AI assistant to get personalized recommendations
          </p>
          <Link href="/chat-ai">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Try AI Assistant
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
