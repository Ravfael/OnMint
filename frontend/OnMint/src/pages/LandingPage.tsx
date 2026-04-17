import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import FeaturedMarquee from "../components/FeaturedMarquee";
import { Wallet, Search, Box, Twitter, Disc as Discord, Instagram, Shield, Award, Zap, Star } from "lucide-react";
import heroImg from "../assets/1.jpg";
import img1 from "../assets/1.jpg";
import img2 from "../assets/2.jpg";
import img3 from "../assets/3.jpg";
import img4 from "../assets/4.jpg";
import img5 from "../assets/5.jpg";
import img6 from "../assets/6.jpg";

const featuredCards = [
  { id: "1", image: img1, price: "1.8", name: "Charizard" },
  { id: "2", image: img2, price: "2.5", name: "Pikachu" },
  { id: "3", image: img3, price: "6.4", name: "Lugia" },
  { id: "4", image: img4, price: "3.2", name: "Dialga" },
  { id: "5", image: img5, price: "4.0", name: "Palkia" },
  { id: "6", image: img6, price: "5.1", name: "Lunala" },
];

export default function LandingPage() {
  const [stats, setStats] = useState({ minted: 0, volume: 0, trainers: 0, generations: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Stats Animation on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const duration = 2000;
          const interval = 20;
          const steps = duration / interval;

          const timer = setInterval(() => {
            start++;
            if (start <= steps) {
              const progress = start / steps;
              const eased = 1 - Math.pow(1 - progress, 3);
              setStats({
                minted: Math.floor(eased * 48291),
                volume: Math.floor(eased * 12840),
                trainers: Math.floor(eased * 9300),
                generations: Math.floor(eased * 151),
              });
            } else {
              clearInterval(timer);
            }
          }, interval);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // 3D Card tilt
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -15; // Max 15deg
      const rotateY = ((x - centerX) / centerX) * 15;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
      card.style.transition = "transform 0.5s ease-out";
    };

    const handleMouseEnter = () => {
      card.style.transition = "none";
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);
    card.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
      card.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  return (
    <div className="bg-black min-h-screen text-gray-100 selection:bg-fuchsia-600 selection:text-white">
      <style>{`
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #000; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
        
        .holo-shimmer {
          background: linear-gradient(
            135deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.1) 10%, 
            rgba(255, 255, 255, 0.4) 20%, 
            rgba(255, 255, 255, 0.7) 30%, 
            rgba(255, 255, 255, 0.4) 40%, 
            rgba(255, 255, 255, 0.1) 50%, 
            transparent 100%
          );
          background-size: 400% 400%;
          animation: holoSweep 3s ease infinite;
          opacity: 0;
          transition: opacity 0.3s ease;
          mix-blend-mode: overlay;
        }

        .hero-card:hover .holo-shimmer { opacity: 1; }

        @keyframes holoSweep {
          0% { background-position: 100% 0%; }
          50% { background-position: 0% 100%; }
          100% { background-position: 100% 0%; }
        }

        .crypto-glow {
          box-shadow: 0 0 40px rgba(255, 255, 255, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.1);
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between min-h-[90vh] gap-12 lg:gap-0">
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="flex-1 lg:pr-12 z-10 text-center lg:text-left w-full">
          <div className="inline-block bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md mb-6 inline-flexitems-center gap-2 text-sm font-semibold text-fuchsia-400 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span>
            The #1 Pokémon NFT Marketplace
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1] mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500">
            Collect. Trade. Own.
            <br />
            <span className="inline-block bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500 bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">The Rarest Pokémon</span>
            <br />
            Cards on Chain.
          </h1>

          <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
            OnMint brings legendary Pokémon TCG cards to the blockchain. Mint, buy, and trade authenticated NFT cards from every generation with true digital ownership.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start relative z-10">
            <Link
              to="/mint"
              className="bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-500 hover:to-fuchsia-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-fuchsia-900/50 hover:shadow-fuchsia-900/80 hover:-translate-y-1 w-full sm:w-auto text-center"
            >
              Start Minting
            </Link>
            <Link
              to="/marketplace"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full font-bold text-lg transition-all backdrop-blur-md w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer z-20"
            >
              <Search size={20} /> Explore Market
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center lg:justify-end z-10 perspective-1000 w-full relative">
          <div className="relative isolate w-full max-w-[280px] sm:max-w-[360px] lg:max-w-[420px] aspect-[63/88] rounded-3xl" ref={cardRef}>
            <div className="hero-card absolute inset-0 bg-gray-900 rounded-[2rem] border border-white/20 p-2 crypto-glow overflow-hidden shadow-2xl transition-transform duration-500">
              <div className="holo-shimmer absolute inset-0 z-20 pointer-events-none rounded-[1.8rem]"></div>
              <div className="relative w-full h-full bg-black rounded-[1.5rem] overflow-hidden">
                <img src={heroImg} alt="Charizard Holographic NFT" className="w-full h-full object-cover object-center" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  {/* <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-3xl font-black text-white leading-none">Charizard</h3>
                      <p className="text-fuchsia-400 font-bold mt-1 tracking-widest uppercase text-sm">Base Set · 1st Edition</p>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-gray-900/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 z-30 transform hover:scale-105 transition-transform cursor-pointer">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]"></div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Current Bid</p>
                <p className="text-xl font-black text-white flex items-center gap-1">
                  <svg viewBox="0 0 320 512" width="14" height="14" fill="currentColor">
                    <path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" />
                  </svg>{" "}
                  2.4 ETH
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section ref={statsRef} className="border-y border-white/10 bg-white/[0.02] backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4 divide-x-0 lg:divide-x divide-white/10">
          <div className="text-center md:px-4">
            <h4 className="text-2xl sm:text-4xl font-black text-white mb-1">{stats.minted.toLocaleString()}+</h4>
            <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-widest">Total NFTs Minted</p>
          </div>
          <div className="text-center md:px-4 lg:border-l border-white/10">
            <h4 className="text-2xl sm:text-4xl font-black text-fuchsia-400 mb-1">{stats.volume.toLocaleString()} ETH</h4>
            <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-widest">Total Volume Traded</p>
          </div>
          <div className="text-center md:px-4 lg:border-l border-white/10">
            <h4 className="text-2xl sm:text-4xl font-black text-white mb-1">{stats.trainers.toLocaleString()}+</h4>
            <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-widest">Active Trainers</p>
          </div>
          <div className="text-center md:px-4 lg:border-l border-white/10">
            <h4 className="text-2xl sm:text-4xl font-black text-white mb-1">{stats.generations.toLocaleString()}</h4>
            <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-widest">Generations Supported</p>
          </div>
        </div>
      </section>

      {/* Featured Cards */}
      <section className="py-16 sm:py-24" id="collections">
        <div className="relative flex items-center justify-center mb-10 sm:mb-12 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3">Featured Cards</h2>
            <p className="text-gray-400 text-base sm:text-lg">Hand-picked legendary drops. Don't miss your chance.</p>
          </div>
          <Link to="/marketplace" className="absolute right-6 hidden md:block text-fuchsia-400 hover:text-fuchsia-300 font-bold border-b-2 border-fuchsia-500/30 hover:border-fuchsia-400 pb-1 px-1 transition-all">
            View All Series
          </Link>
        </div>

        {/* GSAP Infinite Marquee — full-bleed */}
        <FeaturedMarquee cards={featuredCards} />
      </section>

      {/* How it Works */}
      <section className="py-16 sm:py-24 bg-white/[0.02] border-y border-white/10 relative overflow-hidden" id="mint">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">How It Works</h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">Start building your ultimate high-tier digital collection in three simple steps.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-10 sm:gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden sm:block absolute top-[40px] left-1/6 right-1/6 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10"></div>

            <div className="text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gray-900 border border-white/10 flex items-center justify-center mb-5 shadow-xl group-hover:-translate-y-2 group-hover:border-green-500/50 transition-all duration-300 relative">
                <div className="absolute -top-3 -right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-600 flex items-center justify-center font-black text-white text-sm shadow-lg">1</div>
                <Wallet size={28} className="text-white group-hover:text-green-400 transition-colors" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-3 text-white">Connect Your Wallet</h3>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">Securely connect your decentralized wallet to authenticate and verify your identity.</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gray-900 border border-white/10 flex items-center justify-center mb-5 shadow-xl group-hover:-translate-y-2 group-hover:border-blue-500/50 transition-all duration-300 relative">
                <div className="absolute -top-3 -right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-white text-sm shadow-lg">2</div>
                <Search size={28} className="text-white group-hover:text-blue-400 transition-colors" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-3 text-white">Browse &amp; Bid</h3>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">Explore thousands of verified cards, place bids, or purchase instantly at market price.</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gray-900 border border-white/10 flex items-center justify-center mb-5 shadow-xl group-hover:-translate-y-2 group-hover:border-yellow-300/50 transition-all duration-300 relative">
                <div className="absolute -top-3 -right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-yellow-500 flex items-center justify-center font-black text-white text-sm shadow-lg">3</div>
                <Box size={28} className="text-white group-hover:text-yellow-400 transition-colors" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-3 text-white">Own It On-Chain</h3>
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">Mint your masterpiece. The NFT is permanently stored on the blockchain forever.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rarity Tiers */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">Every Card Has a Story</h2>
          <p className="text-gray-400 text-base sm:text-lg">Understand the hierarchy of drops. What will you pull?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-gray-900/50 border border-gray-700 p-6 sm:p-8 rounded-3xl hover:border-gray-500 hover:shadow-[0_0_20px_rgba(156,163,175,0.2)] transition-all">
            <Shield className="text-gray-400 mb-5" size={36} />
            <h4 className="text-xl sm:text-2xl font-black text-white mb-2">Common</h4>
            <p className="text-gray-400 mb-4 text-sm">The foundation of every collection. Plentiful but essential for sets.</p>
            <div className="inline-block px-3 py-1 bg-black rounded-lg text-xs font-bold text-gray-400 border border-gray-700">1 in 10 pulled</div>
          </div>

          <div className="bg-gray-900/50 border border-green-900 p-6 sm:p-8 rounded-3xl hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)] transition-all">
            <Zap className="text-green-500 mb-5" size={36} />
            <h4 className="text-xl sm:text-2xl font-black text-white mb-2">Uncommon</h4>
            <p className="text-gray-400 mb-4 text-sm">Slightly harder to find. Often competitive cards with notable stats.</p>
            <div className="inline-block px-3 py-1 bg-black rounded-lg text-xs font-bold text-green-500 border border-green-900 border-opacity-50">1 in 50 pulled</div>
          </div>

          <div className="bg-gray-900/50 border border-blue-900 p-6 sm:p-8 rounded-3xl hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all">
            <Star className="text-blue-500 mb-5" size={36} />
            <h4 className="text-xl sm:text-2xl font-black text-white mb-2">Rare</h4>
            <p className="text-gray-400 mb-4 text-sm">Highly sought after. Signature foils and fan favorites reside here.</p>
            <div className="inline-block px-3 py-1 bg-black rounded-lg text-xs font-bold text-blue-500 border border-blue-900 border-opacity-50">1 in 200 pulled</div>
          </div>

          <div className="bg-gray-900/50 border border-yellow-700 p-6 sm:p-8 rounded-3xl hover:border-yellow-400 hover:shadow-[0_0_30px_rgba(250,204,21,0.25)] transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-2xl rounded-full"></div>
            <Award className="text-yellow-400 mb-5 relative z-10" size={36} />
            <h4 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600 mb-2 relative z-10">Ultra Rare</h4>
            <p className="text-gray-400 mb-4 text-sm relative z-10">Legendary drops. Holos, secrets, and 1st editions. The holy grails.</p>
            <div className="inline-block px-3 py-1 bg-black rounded-lg text-xs font-bold text-yellow-500 border border-yellow-700 border-opacity-50 relative z-10">1 in 5,000 pulled</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black pt-14 sm:pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
          <div className="col-span-2 md:col-span-1">
            <div className="text-3xl font-black tracking-tighter cursor-pointer text-white mb-4">
              On<span className="text-fuchsia-500">Mint</span>
            </div>
            <p className="text-gray-400 font-medium tracking-wide">Where Legends Are Minted.</p>
          </div>

          <div>
            <h5 className="text-white font-bold mb-4 sm:mb-6 uppercase tracking-widest text-xs sm:text-sm">Platform</h5>
            <ul className="space-y-3">
              <li>
                <Link to="/marketplace" className="text-gray-400 hover:text-fuchsia-400 transition-colors font-medium text-sm">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/mint" className="text-gray-400 hover:text-fuchsia-400 transition-colors font-medium text-sm">
                  Mint
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-fuchsia-400 transition-colors font-medium text-sm">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-fuchsia-400 transition-colors font-medium text-sm">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold mb-4 sm:mb-6 uppercase tracking-widest text-xs sm:text-sm">Community</h5>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-fuchsia-600 hover:text-white hover:border-transparent transition-all">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-fuchsia-600 hover:text-white hover:border-transparent transition-all">
                <Discord size={16} />
              </a>
              <a href="#" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-900 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-fuchsia-600 hover:text-white hover:border-transparent transition-all">
                <Instagram size={16} />
              </a>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h5 className="text-white font-bold mb-4 sm:mb-6 uppercase tracking-widest text-xs sm:text-sm">Get Drop Alerts</h5>
            <div className="flex bg-gray-900 border border-white/10 rounded-xl overflow-hidden focus-within:border-fuchsia-500 transition-colors">
              <input type="email" placeholder="Enter your email" className="bg-transparent border-none outline-none text-white px-3 sm:px-4 py-3 w-full text-sm" />
              <button className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-4 sm:px-6 font-bold transition-colors text-sm whitespace-nowrap">Subscribe</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm font-medium">© 2026 OnMint. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-white text-sm font-medium transition-colors">Terms</a>
            <a href="#" className="text-gray-500 hover:text-white text-sm font-medium transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
