import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { 
  FaGem, FaShieldAlt, FaChartLine, FaGlobe, 
  FaBars, FaTimes, FaArrowRight, FaCheck, FaLock, FaUserShield, FaServer
} from "react-icons/fa";

export default function Landing() {
  const navigate = useNavigate();
  const [activeVideo, setActiveVideo] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  const videos = ["/v1.mp4", "/v2.mp4", "/v3.mp4"];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVideo((prev) => (prev + 1) % videos.length);
    }, 8000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0]);

  const features = [
    {
      title: "AI Design Studio",
      desc: "Turn your ideas into professional 3D jewellery designs instantly. See your vision in 8K quality before you build it.",
      icon: <FaGem className="text-[#d4af37]" />,
      tag: "Design"
    },
    {
      title: "Secure Delivery",
      desc: "Safe island-wide transport for your precious items. Track your package in real-time anywhere in Sri Lanka.",
      icon: <FaGlobe className="text-blue-400" />,
      tag: "Logistics"
    },
    {
      title: "Total Protection",
      desc: "Your data and designs are stored in high-security digital vaults. Only you have the key to your collection.",
      icon: <FaShieldAlt className="text-green-400" />,
      tag: "Security"
    },
    {
      title: "Smart Inventory",
      desc: "Keep track of your gold, gems, and stock levels. Get live market price updates to manage your business better.",
      icon: <FaChartLine className="text-purple-400" />,
      tag: "Business"
    }
  ];

  const pricingTiers = [
    {
      name: "Artisan",
      price: "Free",
      desc: "Perfect for independent designers.",
      features: ["3 AI Design Generations / mo", "Basic Order Tracking", "Portfolio Gallery", "Community Support"],
      button: "Get Started",
      highlight: false
    },
    {
      name: "Studio",
      price: "Rs. 15,000",
      period: "/ mo",
      desc: "Ideal for growing jewellery shops.",
      features: ["Unlimited AI Designs", "Full Production Tracking", "Live Market Prices", "Inventory Management"],
      button: "Start Free Trial",
      highlight: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      desc: "For large manufacturing networks.",
      features: ["Bulk QR Labelling", "Advanced Analytics", "Dedicated Support", "Custom API Access"],
      button: "Contact Sales",
      highlight: false
    }
  ];

  return (
    <div className="relative bg-black text-white selection:bg-[#d4af37]/30 overflow-x-hidden font-sans">
      
      {/* --- CINEMATIC BACKGROUND --- */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeVideo}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 w-full h-full"
          >
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src={videos[activeVideo]} type="video/mp4" />
            </video>
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black"></div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled ? "bg-black/90 backdrop-blur-md py-4 border-b border-white/10" : "bg-transparent py-8"}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#f4d03f] flex items-center justify-center">
              <FaGem className="text-black text-lg" />
            </div>
            <span className="text-2xl font-bold tracking-tighter">SJM <span className="text-[#d4af37]">PRO</span></span>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {["Features", "Security", "Pricing"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-[#d4af37] transition-colors">{item}</a>
            ))}
            <button onClick={() => navigate("/login")} className="px-6 py-2 rounded-full bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all">Sign In</button>
          </div>

          <button className="lg:hidden text-2xl" onClick={() => setMobileMenuOpen(true)}>
            <FaBars />
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen flex items-center justify-center px-6">
        <motion.div style={{ y: y1, opacity: opacityHero }} className="text-center z-10">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-[#d4af37]/30 backdrop-blur-sm mb-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">Sri Lanka's #1 Jewellery Platform</span>
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter mb-6">
            Design. Manage. <br />
            <span className="bg-gradient-to-r from-[#d4af37] to-[#f4d03f] bg-clip-text text-transparent italic">Grow Your Business.</span>
          </h1>
          <p className="max-w-xl mx-auto text-gray-400 text-lg md:text-xl mb-10 leading-relaxed font-medium">
            The all-in-one system for Sri Lankan jewellery shops. Create AI designs, track orders, and secure your stock with ease.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate("/register")} className="w-full sm:w-auto px-10 py-4 rounded-xl bg-[#d4af37] text-black font-bold uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-lg">Start For Free <FaArrowRight className="inline ml-2" /></button>
            <button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })} className="w-full sm:w-auto px-10 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md font-bold text-sm hover:bg-white/10 transition-all">View Features</button>
          </div>
        </motion.div>
      </section>

      {/* --- FEATURE SECTION --- */}
      <section id="features" className="relative py-24 px-6 bg-black">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[#d4af37] font-bold uppercase tracking-widest text-sm mb-2">Our Services</h2>
            <p className="text-3xl md:text-5xl font-bold">Built for modern artisans.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} whileHover={{ y: -8 }} className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/5 hover:border-[#d4af37]/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl mb-6">{f.icon}</div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{f.desc}</p>
                <span className="text-[10px] font-bold uppercase text-[#d4af37] tracking-widest">{f.tag}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECURITY SECTION --- */}
      <section id="security" className="relative py-24 px-6 bg-[#050505]">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-[#d4af37] font-bold uppercase tracking-widest text-sm mb-2">Maximum Security</h2>
              <p className="text-4xl md:text-5xl font-bold mb-6">Your data is safe <br /> with us.</p>
              <p className="text-gray-400 mb-10 leading-relaxed">We use enterprise-grade encryption and secure island-wide protocols to ensure your business and customer information never leave your control.</p>
              
              <div className="space-y-6">
                {[
                  { icon: <FaLock />, t: "Encrypted Storage", d: "All designs and financial logs are protected by 256-bit AES encryption." },
                  { icon: <FaUserShield />, t: "OTP Verification", d: "Secure login using email-based verification codes for every session." },
                  { icon: <FaServer />, t: "Daily Backups", d: "Your inventory data is backed up every 24 hours in secure cloud locations." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] flex-shrink-0">{item.icon}</div>
                    <div>
                      <h4 className="font-bold text-white text-sm uppercase">{item.t}</h4>
                      <p className="text-gray-500 text-xs mt-1 leading-relaxed">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-10 bg-[#d4af37]/5 blur-[100px] rounded-full"></div>
              <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80" alt="Security" className="relative rounded-3xl border border-white/10 shadow-2xl opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="relative py-24 px-6 bg-black">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[#d4af37] font-bold uppercase tracking-widest text-sm mb-2">Pricing Plans</h2>
            <p className="text-3xl md:text-5xl font-bold">Simple plans for every shop.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, i) => (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.02 }}
                className={`p-10 rounded-[2.5rem] border ${tier.highlight ? 'bg-[#111] border-[#d4af37] shadow-[0_0_40px_rgba(212,175,55,0.1)]' : 'bg-[#0a0a0a] border-white/5'} flex flex-col`}
              >
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <p className="text-gray-500 text-sm mb-8">{tier.desc}</p>
                <div className="mb-8">
                  <span className="text-4xl font-black">{tier.price}</span>
                  {tier.period && <span className="text-gray-500 text-sm">{tier.period}</span>}
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {tier.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-400">
                      <FaCheck className="text-[#d4af37] text-xs" /> {feat}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-4 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${tier.highlight ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                  {tier.button}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-black py-16 px-6 border-t border-white/5">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <span className="text-2xl font-bold italic tracking-tighter">SJM <span className="text-[#d4af37] not-italic">PRO</span></span>
            <p className="text-gray-600 text-[10px] mt-2 uppercase tracking-[0.3em] font-bold">Enterprise Management</p>
          </div>
          <div className="flex gap-10 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <a href="#" className="hover:text-white transition-all">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-all">Support Center</a>
            <a href="#" className="hover:text-white transition-all">Contact Us</a>
          </div>
        </div>
        <div className="container mx-auto mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em]">© 2026 SJM PRO Sri Lanka. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="fixed inset-0 z-[100] bg-black p-10 flex flex-col items-center justify-center gap-8 text-2xl font-bold">
            <button className="absolute top-10 right-10 text-4xl" onClick={() => setMobileMenuOpen(false)}><FaTimes /></button>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#security" onClick={() => setMobileMenuOpen(false)}>Security</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <button onClick={() => { setMobileMenuOpen(false); navigate("/login"); }} className="px-10 py-3 rounded-full bg-[#d4af37] text-black text-lg">Sign In</button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #d4af37; border-radius: 10px; }
      `}</style>
    </div>
  );
}