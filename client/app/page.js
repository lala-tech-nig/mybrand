'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Smartphone, Share2, ShoppingBag, Star, ArrowRight, Zap, Globe, ShieldCheck, Gem, CheckCircle, TrendingUp } from 'lucide-react';

// Animated number counter
function Counter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = Math.ceil(end / 60);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [inView, end]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// Floating brand card mockup
function BrandCardMockup() {
  return (
    <div className="relative bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-xl w-full max-w-sm">
      {/* Glow */}
      <div className="absolute -inset-1 bg-gradient-to-br from-[#FF6600]/30 to-purple-600/20 rounded-3xl blur-xl opacity-60" />
      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF6600] to-[#ff9933] flex items-center justify-center text-white font-black text-2xl shadow-lg">S</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">ShoePlug NG</span>
              <span className="flex items-center gap-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <ShieldCheck size={10} /> Verified
              </span>
              <span className="text-base">💎</span>
            </div>
            <p className="text-zinc-500 text-xs">shoeplug.mybrand.ng</p>
          </div>
        </div>

        {/* Sliding banner preview */}
        <div className="rounded-2xl overflow-hidden mb-4 h-28 bg-gradient-to-br from-zinc-800 to-zinc-900 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 rounded-full bg-[#FF6600]/20 mx-auto mb-1 flex items-center justify-center">
                <Smartphone size={16} className="text-[#FF6600]" />
              </div>
              <span className="text-zinc-600 text-xs">Banner Carousel • 3 images</span>
            </div>
          </div>
          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            <span className="w-4 h-1 rounded-full bg-white" />
            <span className="w-1.5 h-1 rounded-full bg-white/30" />
            <span className="w-1.5 h-1 rounded-full bg-white/30" />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Views', val: '12.4K' },
            { label: 'Sales', val: '348' },
            { label: 'Followers', val: '2.1K' },
          ].map(s => (
            <div key={s.label} className="bg-zinc-800/60 rounded-xl p-2.5 text-center">
              <div className="text-white font-black text-sm">{s.val}</div>
              <div className="text-zinc-500 text-[10px]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* WhatsApp button */}
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl p-3">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs">W</span>
          </div>
          <span className="text-green-400 text-xs font-bold">Order via WhatsApp → 24 new enquiries</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#FF6600] selection:text-white overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/">
            <span className="text-xl font-black tracking-tighter">my<span className="text-[#FF6600]">Brand</span>.</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors hidden sm:block">Login</Link>
            <Link href="/register">
              <span className="bg-[#FF6600] text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-[#ff8533] transition-all hover:shadow-[0_0_20px_rgba(255,102,0,0.4)]">
                Get Started Free
              </span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF6600] rounded-full blur-[160px] opacity-10" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600 rounded-full blur-[140px] opacity-10" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.02%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-100" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[#FF6600] text-xs font-bold mb-8 uppercase tracking-wider"
              >
                <Zap size={12} fill="currentColor" /> The #1 Platform for Nigerian Brands
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6 leading-[0.95]"
              >
                Build Your Brand.{' '}
                <span className="relative">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6600] via-[#ff8533] to-[#ff9933]">
                    Get Verified.
                  </span>
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6600] to-[#ff9933] rounded-full" />
                </span>
                {' '}Dominate.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed max-w-xl"
              >
                Your all-in-one digital storefront. Get a verified badge, earn status gems, and sell directly via WhatsApp — all from ₦2,000/month.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                <Link href="/register">
                  <button className="h-14 px-8 text-lg rounded-full bg-[#FF6600] text-white hover:bg-[#ff8533] transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,102,0,0.35)] font-bold flex items-center gap-3">
                    Start for Free <ArrowRight size={20} className="animate-pulse" />
                  </button>
                </Link>
                <Link href="/pricing">
                  <button className="h-14 px-8 text-lg rounded-full border border-zinc-700 text-zinc-300 hover:bg-white/5 hover:border-white hover:text-white transition-all font-medium">
                    View Pricing
                  </button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-8 flex-wrap"
              >
                {[
                  { end: 5200, suffix: '+', label: 'Brands registered' },
                  { end: 48000, suffix: '+', label: 'Products listed' },
                  { end: 97, suffix: '%', label: 'Satisfaction rate' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center sm:text-left">
                    <div className="text-2xl font-black text-white">
                      <Counter end={stat.end} suffix={stat.suffix} />
                    </div>
                    <div className="text-zinc-500 text-xs font-medium">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Brand Card Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hidden lg:flex justify-center items-center relative"
            >
              {/* Floating feature pills */}
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="absolute -top-8 -left-8 flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-full px-4 py-2 shadow-xl text-sm font-bold text-white z-10"
              >
                <ShieldCheck size={16} className="text-blue-400" /> Verified Business
              </motion.div>
              <motion.div
                animate={{ y: [6, -6, 6] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                className="absolute -bottom-4 -right-4 flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-full px-4 py-2 shadow-xl text-sm font-bold text-white z-10"
              >
                💎 Diamond Status
              </motion.div>
              <motion.div
                animate={{ y: [4, -4, 4] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="absolute top-1/2 -right-12 flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-2 shadow-xl text-xs font-bold text-green-400 z-10"
              >
                <TrendingUp size={12} /> +24 orders today
              </motion.div>

              <BrandCardMockup />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-zinc-600 text-xs font-medium">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 rounded-full border-2 border-zinc-700 flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-2 bg-zinc-500 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section id="features" className="py-32 bg-zinc-950 border-y border-white/5 relative">
        <div className="container mx-auto px-6">
          <div className="mb-20 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#FF6600] text-sm font-bold uppercase tracking-widest mb-4"
            >
              Everything You Need
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
            >
              Built for speed.{' '}
              <span className="text-[#FF6600]">Designed for growth.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-zinc-400 text-xl max-w-2xl mx-auto"
            >
              Everything you need to run your business, stripped of the complexity.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard icon={<Smartphone size={28} className="text-[#FF6600]" />} title="Mobile First" desc="Your store looks perfect on every phone. Optimized for the Nigerian market." delay={0} />
            <FeatureCard icon={<ShoppingBag size={28} className="text-[#FF6600]" />} title="WhatsApp Store" desc="Receive orders directly to your DM. No middleman, just business." delay={0.1} />
            <FeatureCard icon={<Globe size={28} className="text-[#FF6600]" />} title="Custom Subdomain" desc='Get your own unique link (e.g., shoeplug.ibrand.ng) instantly.' delay={0.2} />
            <FeatureCard icon={<ShieldCheck size={28} className="text-[#FF6600]" />} title="Verified Badge" desc="Build trust with customers. Premium brands get a blue verified badge." delay={0.3} highlight />
            <FeatureCard icon={<Gem size={28} className="text-[#FF6600]" />} title="Status Gems" desc="Flex your prestige — Bronze, Silver, Gold, and Diamond gem tiers." delay={0.4} highlight />
            <FeatureCard icon={<Star size={28} className="text-[#FF6600]" />} title="Reputation System" desc="Let your service speak for itself with our 'Drags & Praises' system." delay={0.5} />
          </div>
        </div>
      </section>

      {/* ══════════════ PREMIUM TEASER ══════════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-zinc-950" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-bold mb-8"
            >
              <Gem size={14} /> Premium Features
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black tracking-tight mb-6"
            >
              Go Premium for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6600] to-[#ff9933]">₦2,000/month</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-zinc-400 text-xl mb-10 max-w-2xl mx-auto"
            >
              Unlock a verified badge, up to 5 sliding banner images, and exclusive status gems.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-3 mb-10"
            >
              {['✓ Verified Business Badge', '💎 Status Gems', '🖼️ 5 Sliding Banner Images', '📊 Advanced Analytics', '∞ Unlimited Products'].map(f => (
                <span key={f} className="bg-zinc-900 border border-white/10 px-4 py-2 rounded-full text-sm font-medium text-zinc-300">{f}</span>
              ))}
            </motion.div>
            <Link href="/pricing">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-16 px-12 text-xl rounded-full bg-[#FF6600] text-white font-black hover:bg-[#ff8533] shadow-[0_0_40px_rgba(255,102,0,0.35)] transition-all"
              >
                See All Plans <ArrowRight className="inline ml-2" size={20} />
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ CTA ══════════════ */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#FF6600]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-multiply" />
        </div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-8xl font-black tracking-tighter mb-8 text-white uppercase"
          >
            Don&apos;t Just Exist. <br /><span className="text-black">Dominate.</span>
          </motion.h2>
          <p className="text-white/80 text-2xl mb-12 max-w-2xl mx-auto font-medium">Join 5,000+ Nigerian brands scaling with myBrand today.</p>
          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-20 px-12 text-2xl rounded-full bg-white text-[#FF6600] border-4 border-transparent hover:border-black transition-all shadow-2xl font-black"
            >
              CLAIM YOUR LINK
            </motion.button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-xl font-black tracking-tighter mb-1">my<span className="text-[#FF6600]">Brand</span>.</div>
            <div className="text-zinc-500 text-sm">© 2026 myBrand Inc. Lagos, Nigeria.</div>
          </div>
          <div className="flex gap-8 text-sm font-bold text-zinc-400">
            <Link href="/pricing" className="hover:text-[#FF6600] transition-colors">Pricing</Link>
            <Link href="#" className="hover:text-[#FF6600] transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-[#FF6600] transition-colors">Terms</Link>
            <Link href="#" className="hover:text-[#FF6600] transition-colors">Twitter</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay, highlight }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className={`p-8 rounded-3xl border transition-all group relative overflow-hidden ${highlight
        ? 'bg-zinc-900 border-[#FF6600]/20 hover:border-[#FF6600]/40'
        : 'bg-black border-white/5 hover:border-white/10'
        }`}
    >
      {highlight && (
        <div className="absolute top-0 right-0 text-[10px] font-black bg-[#FF6600] text-white px-3 py-1 rounded-bl-xl">PREMIUM</div>
      )}
      <div className="absolute top-0 right-0 p-32 bg-[#FF6600] rounded-full blur-[80px] opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none" />
      <div className="bg-zinc-800/50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-[#FF6600] transition-colors">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{desc}</p>
    </motion.div>
  );
}
