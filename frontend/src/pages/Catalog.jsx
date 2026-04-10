import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '@/store/slices/productSlice';
import { Filter, Search, SlidersHorizontal, ChevronDown, MoveRight } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Container } from '@/components/common/Container';
import { getImageUrl } from '@/utils/image';

const CATEGORIES = [
  { id: 'all', name: 'All Collections', desc: 'Explore our entire heritage of fine timepieces' },
  { id: 'luxury', name: 'Luxury Elite', desc: 'The pinnacle of craftsmanship and prestige' },
  { id: 'sport', name: 'Precision Sport', desc: 'Engineered for performance, designed for excellence' },
  { id: 'classic', name: 'Heritage Classic', desc: 'Timeless designs that transcend generations' }
];

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const sortParam = searchParams.get('sort') || 'newest';
  const searchParamAttr = searchParams.get('search') || '';
  const maxPriceParam = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null;
  
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector(state => state.products);

  const [searchQuery, setSearchQuery] = useState(searchParamAttr);
  const [filteredWatches, setFilteredWatches] = useState([]);
  const [priceRange, setPriceRange] = useState(maxPriceParam || 500000);
  const [sortBy, setSortBy] = useState(sortParam);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Sync state with URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (categoryParam !== 'all') params.set('category', categoryParam);
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (searchQuery) params.set('search', searchQuery); else params.delete('search');
    if (priceRange < 500000) params.set('maxPrice', priceRange); else params.delete('maxPrice');
    setSearchParams(params, { replace: true });
  }, [categoryParam, sortBy, searchQuery, priceRange]);

  useEffect(() => {
    let result = products ? [...products] : [];

    // Category Filter
    if (categoryParam !== 'all') {
      result = result.filter(watch => watch.category?.toLowerCase() === categoryParam.toLowerCase());
    }

    // Search Filter
    if (searchQuery) {
      result = result.filter(watch => 
        watch.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price Filter
    result = result.filter(watch => watch.price <= priceRange);

    // Sorting Logic
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else {
      // Default newest - assume ID or createdAt
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredWatches(result);
  }, [categoryParam, searchQuery, priceRange, sortBy, products]);

  const handleCategoryChange = (catId) => {
    const params = new URLSearchParams(searchParams);
    if (catId === 'all') params.delete('category');
    else params.set('category', catId);
    setSearchParams(params);
  };

  const activeCategory = CATEGORIES.find(c => c.id === categoryParam) || CATEGORIES[0];

  return (
    <div className="bg-white min-h-screen pt-32 pb-20 fade-in">
      <Container>
        
        {/* Header Block */}
        <div className="mb-20">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-[var(--accent)] mb-4 block animate-fade-in">Registry / {activeCategory.name}</span>
            <h1 className="text-4xl md:text-6xl font-bold uppercase tracking-[0.1em] text-black mb-6 leading-tight">
              Curated Collections
            </h1>
            <p className="text-gray-400 text-xs md:text-sm uppercase tracking-[0.2em] font-medium max-w-xl">
              {activeCategory.desc}
            </p>
          </div>
          
          {/* Top Control Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 py-6 border-y border-gray-100">
            <div className="flex items-center gap-10">
               {['all', 'luxury', 'sport', 'classic'].map(cat => (
                 <button 
                   key={cat}
                   onClick={() => handleCategoryChange(cat)}
                   className={`text-[9px] font-bold uppercase tracking-[0.3em] transition-all hover:text-black border-b-2 pb-1 ${categoryParam === cat ? 'border-[var(--accent)] text-black' : 'border-transparent text-gray-300'}`}
                 >
                   {cat}
                 </button>
               ))}
            </div>
            
            <div className="flex items-center gap-8 w-full md:w-auto">
               <div className="relative group w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-black transition-colors" />
                  <input 
                    type="text"
                    placeholder="Search Model"
                    className="w-full bg-transparent border-0 pl-8 py-2 text-[10px] uppercase tracking-[0.2em] font-bold focus:outline-none placeholder:text-gray-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
               <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-3 text-[9px] uppercase tracking-[0.3em] font-bold text-black border border-black px-6 py-3 hover:bg-black hover:text-white transition-all duration-300"
              >
                <SlidersHorizontal className="w-3 h-3" /> 
                Refine
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 relative">
          
          {/* Sidebar Filters - Desktop Slide-in or Fixed */}
          {showFilters && (
            <aside className="w-full lg:w-72 shrink-0 animate-fade-in h-fit sticky top-32 z-20 bg-white">
              <div className="space-y-12">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black mb-8 border-b border-gray-100 pb-4">
                    Price Parameters
                  </h3>
                  <div className="px-2">
                    <input 
                      type="range" 
                      min="1000" 
                      max="500000" 
                      step="5000"
                      value={priceRange}
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      className="w-full accent-black h-[1px] bg-gray-100 appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between items-center mt-6">
                       <div>
                          <p className="text-[8px] uppercase tracking-widest text-gray-400 font-bold mb-1">Max Valuation</p>
                          <p className="text-xs font-bold text-black tracking-widest">₹{priceRange.toLocaleString()}</p>
                       </div>
                       <button className="text-[8px] uppercase tracking-widest text-[var(--accent)] font-bold active:scale-95" onClick={() => setPriceRange(500000)}>Reset</button>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-50">
                   <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black mb-6">Sort Registry</h3>
                   <div className="space-y-4">
                      {[
                        { id: 'newest', label: 'Newest Arrivals' },
                        { id: 'price-high', label: 'Valuation: High to Low' },
                        { id: 'price-low', label: 'Valuation: Low to High' }
                      ].map(opt => (
                        <label key={opt.id} className="flex items-center gap-4 cursor-pointer group">
                           <input 
                             type="radio" 
                             className="hidden" 
                             name="sort" 
                             checked={sortBy === opt.id}
                             onChange={() => setSortBy(opt.id)}
                           />
                           <div className={`w-3 h-3 border rounded-full transition-colors ${sortBy === opt.id ? 'border-black bg-black' : 'border-gray-200 group-hover:border-black'}`} />
                           <span className={`text-[10px] uppercase tracking-[0.15em] font-bold transition-colors ${sortBy === opt.id ? 'text-black' : 'text-gray-400 group-hover:text-black'}`}>{opt.label}</span>
                        </label>
                      ))}
                   </div>
                </div>
              </div>
            </aside>
          )}

          {/* Grid Area */}
          <main className="flex-1">
            {loading ? (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-16 gap-x-12">
                 {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="animate-pulse">
                       <div className="bg-gray-50 aspect-[4/5] mb-6" />
                       <div className="h-4 bg-gray-50 w-3/4 mb-4" />
                       <div className="h-4 bg-gray-50 w-1/4" />
                    </div>
                 ))}
               </div>
            ) : error ? (
               <div className="text-center py-20 border border-rose-100 bg-rose-50/30">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-rose-500">Registry Error</p>
                  <p className="text-sm font-bold text-rose-600 mt-2">{error}</p>
               </div>
            ) : (
                <>
                  <div className="mb-12 flex justify-between items-end">
                    <p className="text-[8px] uppercase tracking-[0.4em] font-bold text-gray-400">Inventory Status: <span className="text-black">{filteredWatches.length} Units Found</span></p>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[8px] uppercase tracking-widest font-bold text-emerald-500">In Stock</span>
                    </div>
                  </div>
                  
                  {filteredWatches.length === 0 ? (
                    <div className="text-center py-32 border border-gray-50 flex flex-col items-center">
                      <Search className="w-8 h-8 text-gray-100 mb-6" />
                      <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black mb-4">No Matches Found in Registry</h3>
                      <button className="text-[8px] uppercase tracking-widest font-bold text-[var(--accent)] border-b border-[var(--accent)] pb-1" onClick={() => {setSearchQuery(''); setPriceRange(500000); handleCategoryChange('all');}}>Clear All Filters</button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-y-20 gap-x-12">
                      {filteredWatches.map((watch, i) => (
                        <Link 
                          to={`/product/${watch._id}`} 
                          key={watch._id} 
                          className="group block"
                          style={{ animationDelay: `${i * 100}ms` }}
                        >
                          <div className="relative overflow-hidden mb-8 bg-[#FBFBFB]">
                            <div className="aspect-[4/5] p-12 flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                              <img 
                                src={getImageUrl(watch.images?.[0] || watch.image)} 
                                alt={watch.name}
                                className="w-full h-full object-contain mix-blend-darken"
                              />
                            </div>
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <div className="absolute bottom-8 left-0 right-0 px-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                               <div className="bg-white flex items-center justify-between p-4 shadow-xl">
                                  <span className="text-[8px] uppercase tracking-[0.3em] font-bold">View Asset</span>
                                  <MoveRight className="w-3 h-3" />
                               </div>
                            </div>

                            {watch.countInStock < 3 && watch.countInStock > 0 && (
                               <div className="absolute top-6 left-6 bg-rose-500 text-white text-[7px] uppercase tracking-[0.3em] font-black px-3 py-1.5 shadow-lg">
                                 Final Units
                               </div>
                            )}
                            {watch.countInStock <= 0 && (
                               <div className="absolute top-6 left-6 bg-gray-400 text-white text-[7px] uppercase tracking-[0.3em] font-black px-3 py-1.5 shadow-lg">
                                 Out of Stock
                               </div>
                            )}
                          </div>
                          
                          <div className="text-center px-4">
                            <span className="text-[8px] uppercase tracking-[0.4em] font-bold text-gray-300 group-hover:text-[var(--accent)] transition-colors mb-3 block">{watch.category}</span>
                            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-black mb-3">{watch.name}</h3>
                            <p className="text-[10px] font-bold text-black tracking-[0.2em]">₹{watch.price?.toLocaleString()}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
            )}
          </main>
          
        </div>
      </Container>
    </div>
  );
};

export default Catalog;
