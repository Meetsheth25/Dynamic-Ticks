import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/store/slices/productSlice';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { getImageUrl } from '@/utils/image';

const CATEGORIES = [
  { id: 'Luxury', name: 'Luxury', image: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?auto=format&fit=crop&q=80&w=800' },
  { id: 'Sport', name: 'Sport', image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800' },
  { id: 'Classic', name: 'Classic', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=800' }
];

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, loading } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const featured = products ? products.slice(0, 8) : [];

  return (
    <div className="bg-white min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1619134769735-31ce30ea7dae?auto=format&fit=crop&q=80&w=2000"
            alt="Hero Watch"
            className="w-full h-full object-cover opacity-60 scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
        </div>
        
        <div className="relative z-10 text-center px-4 fade-in">
          <span className="text-[var(--accent)] font-medium tracking-[0.4em] uppercase text-xs mb-6 block">
            The Pinnacle of Horology
          </span>
          <h1 className="text-4xl md:text-7xl font-light text-white leading-tight mb-8 tracking-[0.1em]">
            Crafted for Time.<br/>
            <span className="font-bold">Designed for You.</span>
          </h1>
          <div className="flex justify-center gap-6">
            <Button 
              onClick={() => navigate('/catalog')} 
              className="px-12 py-5 bg-white text-black hover:bg-[var(--accent)] hover:text-white border-none"
            >
              Shop Now
            </Button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
           <div className="w-[1px] h-12 bg-white/30 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[var(--accent)] animate-scroll-indicator" />
           </div>
           <span className="text-[8px] uppercase tracking-[0.4em] text-white/50 font-medium">Scroll</span>
        </div>
      </section>

      {/* COLLECTION SECTION - Horizontal Scroll */}
      <section className="py-32 bg-[var(--bg-soft)]">
        <Container>
          <div className="flex justify-between items-end mb-16">
            <div>
              <span className="text-[var(--accent)] font-medium tracking-[0.3em] uppercase text-[10px] mb-3 block">Categories</span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-[0.05em]">Collections</h2>
            </div>
            <Link to="/catalog" className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold group">
              Explore All <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
            </Link>
          </div>

          <div className="flex overflow-x-auto gap-8 pb-10 scrollbar-hide snap-x">
            {CATEGORIES.map(category => (
              <Link 
                to={`/catalog?category=${category.id}`} 
                key={category.id} 
                className="min-w-[300px] md:min-w-[400px] aspect-[3/4] group relative overflow-hidden snap-start"
              >
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                <div className="absolute inset-x-0 bottom-0 p-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-2xl font-bold text-white mb-2 tracking-wider uppercase">{category.name}</h3>
                  <div className="w-8 h-0.5 bg-[var(--accent)] transition-all duration-500 group-hover:w-16" />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* PRODUCT SHOWCASE */}
      <section className="py-32 bg-white">
        <Container>
          <div className="text-center mb-20">
            <span className="text-[var(--accent)] font-medium tracking-[0.3em] uppercase text-[10px] mb-3 block">Timeless Pieces</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-[0.05em]">Selected Timepieces</h2>
            <div className="w-20 h-1 bg-black mx-auto mt-8" />
          </div>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
               {[1,2,3,4].map(idx => (
                 <div key={idx} className="animate-pulse">
                   <div className="aspect-[4/5] bg-gray-100 mb-6" />
                   <div className="h-4 bg-gray-100 w-2/3 mb-2" />
                   <div className="h-4 bg-gray-100 w-1/3" />
                 </div>
               ))}
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {featured.map((watch) => (
                <Link to={`/product/${watch._id}`} key={watch._id} className="group block">
                  <div className="relative overflow-hidden aspect-[4/5] bg-[var(--bg-soft)] mb-6 flex items-center justify-center p-12">
                    <img 
                      src={getImageUrl(watch.images[0])}
                      alt={watch.name}
                      className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] uppercase tracking-widest text-[#999] mb-2 block">{watch.category}</span>
                    <h3 className="text-lg font-medium text-black mb-2 tracking-wide group-hover:text-[var(--accent)] transition-colors">{watch.name}</h3>
                    <p className="text-black font-bold tracking-widest">Rs. {watch.price?.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-20 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/catalog')}
              className="px-12 border-black/10 hover:border-black"
            >
              View Full Collection
            </Button>
          </div>
        </Container>
      </section>

      {/* PROMO SECTION */}
      <section className="relative h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=2000"
            alt="Craftsmanship"
            className="w-full h-full object-cover grayscale opacity-80"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <Container className="relative z-10 text-center text-white">
          <h2 className="text-3xl md:text-5xl font-light tracking-[0.2em] mb-8">ELEGANCE IN EVERY TICK</h2>
          <p className="max-w-xl mx-auto text-gray-300 font-light leading-loose text-sm uppercase tracking-widest mb-10">
            Our master watchmakers combine tradition with modern innovation to deliver unmatched precision.
          </p>
          <Button 
            className="bg-transparent border-white text-white hover:bg-white hover:text-black"
            variant="outline"
            onClick={() => navigate('/catalog')}
          >
            Discover More
          </Button>
        </Container>
      </section>

    </div>
  );
};

export default Home;
