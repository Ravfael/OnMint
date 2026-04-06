interface CardProps {
  id: string;
  image: string;
  price: string;
  name: string;
}

export default function CardComponent({ id, image, price, name }: CardProps) {
  return (
    <div
      key={id}
      className="nft-card group relative bg-gray-900 rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(255,0,102,0.3)] cursor-pointer snap-center shrink-0 w-72 sm:w-80"
    >
      <div className="holo-overlay absolute inset-0 z-10 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay rounded-2xl"></div>
      <div className="relative z-0 bg-black/50 p-4 aspect-[3/4] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
        <img src={image} alt={name} className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-110" />
      </div>

      <div className="p-5 flex justify-between items-end relative z-20 bg-gray-900">
        <div>
          <h3 className="text-lg font-black text-white mb-1 leading-tight">{name}</h3>
          <p className="text-sm font-medium text-gray-400">Current Bid</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-fuchsia-400 flex items-center justify-end gap-1">
            <svg viewBox="0 0 320 512" width="12" height="12" fill="currentColor">
              <path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" />
            </svg>
            {price}
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full p-5 pt-0 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20">
        <button className="w-full py-3 bg-white/10 hover:bg-fuchsia-600 border border-white/20 hover:border-fuchsia-400 text-white font-bold rounded-xl transition-colors backdrop-blur-md">Place Bid</button>
      </div>
    </div>
  );
}
