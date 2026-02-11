import React from 'react';
import Link from 'next/link';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Smartphone, Share2, ShoppingBag, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-black text-white py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Your Brand, <span className="text-[var(--primary)]">Digitally Reimagined.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Create your free digital business card, connect with customers, and sell products instantly via WhatsApp. The social platform for modern Nigerian businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button className="w-full sm:w-auto text-lg py-6 px-8 h-auto">Create Your Brand Identity</Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" className="w-full sm:w-auto text-lg py-6 px-8 h-auto border-zinc-700 text-white hover:bg-zinc-800">Explore Brands</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-black">Everything You Need to Grow</h2>
            <p className="text-zinc-500">Powerful tools to manage your brand presence and sales.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Smartphone className="h-10 w-10 text-[var(--primary)]" />}
              title="Digital Business Card"
              description="A stunning, mobile-optimized profile that represents your brand identity perfectly."
            />
            <FeatureCard
              icon={<Share2 className="h-10 w-10 text-[var(--primary)]" />}
              title="Social Feed"
              description="Post photos and updates to keep your followers engaged and informed."
            />
            <FeatureCard
              icon={<ShoppingBag className="h-10 w-10 text-[var(--primary)]" />}
              title="Product Catalog"
              description="Showcase your products and sell directly via WhatsApp with one click."
            />
            <FeatureCard
              icon={<Star className="h-10 w-10 text-[var(--primary)]" />}
              title="Reputation System"
              description="Build trust with a verified rating system and customer reviews."
            />
          </div>
        </div>
      </section>

      {/* How It Works / CTA */}
      <section className="py-20 bg-[var(--muted)]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-black">Get your <span className="text-[var(--primary)]">storename.mybrand.com.ng</span> today</h2>
          <p className="mb-8 text-zinc-600">Join thousands of Nigerian businesses growing their digital footprint.</p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-10">Start for Free</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t border-zinc-800">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-2xl font-bold">my<span className="text-[var(--primary)]">Brand</span></span>
            <p className="text-sm text-zinc-500 mt-2">© 2026 myBrand. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="text-zinc-400 hover:text-white">Privacy</Link>
            <Link href="#" className="text-zinc-400 hover:text-white">Terms</Link>
            <Link href="#" className="text-zinc-400 hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-zinc-50">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle className="text-xl mb-2">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-zinc-500">{description}</p>
      </CardContent>
    </Card>
  );
}
