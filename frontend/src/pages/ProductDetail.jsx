import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails, clearProductDetails } from '@/store/slices/productSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { ChevronRight, ShieldCheck, Truck, RefreshCw, Star, Info } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { getImageUrl } from '@/utils/image';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { productDetails: watch, loading, error } = useSelector(state => state.products);
  const [zoom, setZoom] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    dispatch(fetchProductDetails(id));
    return () => {
      dispatch(clearProductDetails());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (watch?.images?.length > 0) {
      setSelectedImage(watch.images[0]);
    }
  }, [watch]);

  const handleAddToCart = () => {
    if (watch) {
      dispatch(addToCart({
        product: watch._id,
        name: watch.name,
        price: watch.price,
        image: watch.images?.[0] || watch.image,
        qty: 1
      }));
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading || !watch) {
    return (
      <div className="min-h-screen pt-24 pb-10 flex items-center justify-center bg-white">
         <div className="w-8 h-8 border-b-2 border-[var(--accent)] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6 text-center">
         <div className="max-w-xs">
            <Info className="w-12 h-12 text-[var(--accent)] mx-auto mb-6" />
            <h2 className="text-xl font-bold uppercase tracking-widest text-black mb-2">Item Unavailable</h2>
            <p className="text-gray-500 mb-8 text-sm">{error}</p>
            <Link to="/catalog">
               <Button className="w-full">Return to Catalog</Button>
            </Link>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-32 pb-20">
      <Container>
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-medium text-gray-400 mb-16 fade-in">
          <Link to="/" className="hover:text-black transition-colors">House</Link>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <Link to="/catalog" className="hover:text-black transition-colors">Collection</Link>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span className="text-black font-bold">{watch.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left: Image Viewer & Gallery */}
          <div className="w-full lg:w-[60%] flex flex-col-reverse lg:flex-row gap-6 fade-in">
            {/* Thumbnails */}
            <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
               {watch.images?.map((img, idx) => (
                 <div 
                   key={idx}
                   onClick={() => setSelectedImage(img)}
                   className={`w-20 h-20 min-w-[5rem] bg-[var(--bg-soft)] border transition-all duration-300 cursor-pointer p-2 flex items-center justify-center ${selectedImage === img ? 'border-black opacity-100 scale-105' : 'border-transparent opacity-50 hover:opacity-80'}`}
                 >
                    <img src={getImageUrl(img)} className="w-full h-full object-contain" alt={`${watch.name} view ${idx + 1}`} />
                 </div>
               ))}
            </div>

            {/* Main Image */}
            <div 
              className="flex-1 relative aspect-square bg-[var(--bg-soft)] flex items-center justify-center p-12 overflow-hidden cursor-zoom-in"
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
            >
              <img 
                src={getImageUrl(selectedImage || (watch.images && watch.images.length > 0 ? watch.images[0] : watch.image))}
                alt={watch.name} 
                className={`w-full h-full object-contain transition-transform duration-1000 ease-out ${zoom ? 'scale-150 relative z-30' : 'scale-100'}`} 
              />
              {!zoom && (
                <div className="absolute bottom-6 right-6 text-[8px] uppercase tracking-[0.3em] font-bold text-gray-400">
                  Hover to Zoom
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="w-full lg:w-[40%] flex flex-col justify-center fade-in">
            
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[var(--accent)] font-medium tracking-[0.3em] uppercase text-[10px] block">
                  {watch.category} Collection
                </span>
                <div className="flex items-center gap-1 text-[8px] uppercase tracking-widest font-bold text-gray-400">
                   <Star className="w-3 h-3 text-[var(--accent)] fill-[var(--accent)]"/>
                   <span>4.9 Heritage Rating</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold text-black tracking-tight mb-6 leading-tight uppercase">
                {watch.name}
              </h1>
              
              <div className="flex items-baseline gap-4 mb-2">
                <p className="text-3xl font-bold text-black tracking-widest">
                  ₹{watch.price?.toLocaleString()}
                </p>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Incl. of all taxes</span>
              </div>
            </div>

            <div className="mb-10">
               <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-black mb-4">The Narrative</h4>
               <p className="text-gray-600 text-[15px] font-light leading-relaxed tracking-wide">
                  {watch.description || "A masterpiece of contemporary horology, this timepiece embodies our commitment to precision and elegance. Every detail, from the hand-polished case to the intricate movement, reflects a legacy of craftsmanship."}
               </p>
            </div>

            <div className="mb-12">
               <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-black mb-4">Specifications</h4>
               <div className="grid grid-cols-2 gap-y-4 text-xs tracking-wider">
                  <div className="flex flex-col gap-1">
                     <span className="text-gray-400 uppercase text-[9px]">Material</span>
                     <span className="font-medium">{watch.material || 'Premium Stainless Steel'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-gray-400 uppercase text-[9px]">Movement</span>
                     <span className="font-medium">Swiss Caliber Auto</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-gray-400 uppercase text-[9px]">Warranty</span>
                     <span className="font-medium">5 Years Global</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-gray-400 uppercase text-[9px]">Case Size</span>
                     <span className="font-medium">42 MM</span>
                  </div>
               </div>
            </div>
            
            <div className="flex flex-col gap-4 mb-16">
               <Button 
                 onClick={handleAddToCart} 
                 disabled={watch.countInStock <= 0}
                 className="w-full py-5 text-xs font-bold bg-black text-white hover:bg-[var(--accent)] transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
               >
                 {watch.countInStock > 0 ? 'Reserve Now' : 'Out of Stock'}
               </Button>
               <Button 
                 onClick={handleBuyNow} 
                 disabled={watch.countInStock <= 0}
                 variant="outline" 
                 className="w-full py-5 text-xs font-bold border-black/10 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed"
               >
                 Purchase Instantly
               </Button>
               {watch.countInStock <= 0 && (
                 <p className="text-[10px] uppercase tracking-widest text-rose-500 font-bold text-center">This asset is currently decommissioned from the vault.</p>
               )}
            </div>
            
            <div className="grid grid-cols-1 gap-6 pt-10 border-t border-gray-100">
              <div className="flex items-start gap-4">
                <ShieldCheck className="w-5 h-5 text-[var(--accent)] shrink-0" />
                <div>
                   <h5 className="text-[10px] uppercase tracking-widest font-bold mb-1">Authenticated Heritage</h5>
                   <p className="text-[10px] text-gray-500 tracking-wide">Every piece comes with a certified certificate of origin.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Truck className="w-5 h-5 text-[var(--accent)] shrink-0" />
                <div>
                   <h5 className="text-[10px] uppercase tracking-widest font-bold mb-1">Global Concierge Shipping</h5>
                   <p className="text-[10px] text-gray-500 tracking-wide">Complimentary insured delivery to your doorstep.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProductDetail;
