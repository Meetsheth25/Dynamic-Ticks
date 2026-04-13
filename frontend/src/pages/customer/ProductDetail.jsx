import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails, clearProductDetails, fetchProductReviews, createProductReview, clearReviewSuccess } from '@/store/slices/productSlice';
import { addToCart } from '@/store/slices/cartSlice';
import { ChevronRight, ShieldCheck, Truck, RefreshCw, Star, Info, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { Container } from '@/components/common/Container';
import { getImageUrl } from '@/utils/image';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { productDetails: watch, loading, error, reviews, reviewSuccess, reviewsError } = useSelector(state => state.products);
  const { user } = useSelector(state => state.auth);
  const [zoom, setZoom] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');


  useEffect(() => {
    dispatch(fetchProductDetails(id));
    dispatch(fetchProductReviews(id));
    return () => {
      dispatch(clearProductDetails());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (reviewSuccess) {
      toast.success('Feedback submitted successfully!');
      setRating(0);
      setComment('');
      dispatch(clearReviewSuccess());
      dispatch(fetchProductReviews(id));
    }
  }, [dispatch, id, reviewSuccess]);

  useEffect(() => {
    if (reviewsError) {
      toast.error(reviewsError);
    }
  }, [reviewsError]);

  useEffect(() => {
    if (watch) {
      if (watch.colorVariants?.length > 0) {
        // Default to first variant's images
        setSelectedColor(watch.colorVariants[0]);
        setSelectedImage(watch.colorVariants[0].images?.[0] || watch.images?.[0] || null);
      } else if (watch.images?.length > 0) {
        setSelectedImage(watch.images[0]);
      }
    }
  }, [watch]);

  const handleColorSelect = (variant) => {
    setSelectedColor(variant);
    if (variant.images?.length > 0) {
      setSelectedImage(variant.images[0]);
    }
  };

  // Current gallery: use selected variant's images, fall back to product images
  const currentGallery = selectedColor?.images?.length > 0
    ? selectedColor.images
    : (watch?.images || []);

  
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }
    dispatch(createProductReview({
      productId: id,
      rating,
      comment
    }));
  };

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
            <div className="flex lg:flex-col gap-5 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar mt-4 lg:mt-0">
               {currentGallery.map((img, idx) => (
                 <button 
                   type="button"
                   key={idx}
                   onClick={() => setSelectedImage(img)}
                   className={`group relative w-16 h-20 lg:w-24 lg:h-28 flex-shrink-0 bg-[#FBFBFB] border transition-all duration-500 ease-out flex items-center justify-center overflow-hidden
                   ${selectedImage === img 
                     ? 'border-black opacity-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] -translate-y-2 lg:-translate-y-0 lg:translate-x-2' 
                     : 'border-black/5 opacity-60 hover:opacity-100 hover:border-black/20 hover:shadow-md'}`}
                 >
                    <img 
                       src={getImageUrl(img)} 
                       className="w-[85%] h-[85%] object-contain mix-blend-darken transition-transform duration-700 ease-out group-hover:scale-110" 
                       alt={`${watch.name} view ${idx + 1}`} 
                    />
                    {selectedImage === img && (
                       <div className="absolute inset-0 border border-black/10 scale-95 pointer-events-none" />
                    )}
                 </button>
               ))}
            </div>

            {/* Main Image */}
            <div 
              className="flex-1 relative aspect-square bg-[var(--bg-soft)] flex items-center justify-center p-12 overflow-hidden cursor-zoom-in"
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
            >
              <img 
                src={getImageUrl(selectedImage || (currentGallery.length > 0 ? currentGallery[0] : watch.image))}
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
                   <span>{watch.rating ? watch.rating.toFixed(1) : 'No'} Heritage Rating ({watch.reviews || 0} Reviews)</span>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold text-black tracking-tight mb-6 leading-tight uppercase">
                {watch.name}
              </h1>
              
              <div className="flex items-baseline gap-4 mb-2">
                <p className="text-3xl font-bold text-black tracking-widest">
                  Rs. {watch.price?.toLocaleString()}
                </p>
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">Incl. of all taxes</span>
              </div>
            </div>

            {/* Colour Variants */}
            {watch.colorVariants?.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-black">
                    Colour — <span style={{ color: selectedColor?.hex || 'inherit' }}>{selectedColor?.name || watch.colorVariants[0]?.name}</span>
                  </h4>
                  {selectedColor && (
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm ${
                      selectedColor.countInStock > 0
                        ? 'text-emerald-600 bg-emerald-50'
                        : 'text-rose-500 bg-rose-50'
                    }`}>
                      {selectedColor.countInStock > 0
                        ? `${selectedColor.countInStock} In Vault`
                        : 'Out of Stock'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {watch.colorVariants.map((variant, idx) => {
                    const isSelected = selectedColor?.name === variant.name;
                    const outOfStock = variant.countInStock <= 0;
                    return (
                      <button
                        key={idx}
                        type="button"
                        title={`${variant.name}${outOfStock ? ' — Out of Stock' : ` — ${variant.countInStock} left`}`}
                        onClick={() => handleColorSelect(variant)}
                        className="relative flex flex-col items-center gap-1.5 group focus:outline-none"
                        style={{ opacity: outOfStock ? 0.5 : 1 }}
                      >
                        <div
                          className={`w-9 h-9 rounded-full border-2 transition-all duration-300 shadow-sm ${
                            isSelected
                              ? 'border-[var(--accent)] scale-110 shadow-[0_0_12px_rgba(201,164,76,0.4)]'
                              : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                          } ${outOfStock ? 'opacity-50' : ''}`}
                          style={{ backgroundColor: variant.hex || '#888' }}
                        >
                          {outOfStock && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-px bg-gray-400 rotate-45 absolute" />
                            </div>
                          )}
                        </div>
                        <span className={`text-[7px] uppercase tracking-[0.15em] font-bold ${
                          isSelected ? 'text-[var(--accent)]' : 'text-gray-400'
                        }`}>{variant.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-10">
               <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-black mb-4">The Narrative</h4>
               <p className="text-gray-600 text-[15px] font-light leading-relaxed tracking-wide">
                  {watch.description || "A masterpiece of contemporary horology, this timepiece embodies our commitment to precision and elegance. Every detail, from the hand-polished case to the intricate movement, reflects a legacy of craftsmanship."}
               </p>
            </div>

            <div className="mb-12">
               <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-black mb-4">Specifications</h4>
               <div className="grid grid-cols-2 gap-y-4 text-xs tracking-wider">
                  {watch.material && (
                    <div className="flex flex-col gap-1">
                       <span className="text-gray-400 uppercase text-[9px]">Material</span>
                       <span className="font-medium">{watch.material}</span>
                    </div>
                  )}
                  {watch.caseDiameter && (
                    <div className="flex flex-col gap-1">
                       <span className="text-gray-400 uppercase text-[9px]">Case Diameter</span>
                       <span className="font-medium">{watch.caseDiameter}</span>
                    </div>
                  )}
                  {watch.movementType && (
                    <div className="flex flex-col gap-1">
                       <span className="text-gray-400 uppercase text-[9px]">Movement</span>
                       <span className="font-medium">{watch.movementType}</span>
                    </div>
                  )}
                  {watch.bandMaterial && (
                    <div className="flex flex-col gap-1">
                       <span className="text-gray-400 uppercase text-[9px]">Band Material</span>
                       <span className="font-medium">{watch.bandMaterial}</span>
                    </div>
                  )}
                  {watch.itemWeight && (
                    <div className="flex flex-col gap-1">
                       <span className="text-gray-400 uppercase text-[9px]">Item Weight</span>
                       <span className="font-medium">{watch.itemWeight}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                     <span className="text-gray-400 uppercase text-[9px]">Country of Origin</span>
                     <span className="font-medium">{watch.countryOfOrigin || 'Hong Kong'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                     <span className="text-gray-400 uppercase text-[9px]">Warranty</span>
                     <span className="font-medium">5 Years Global</span>
                  </div>
               </div>
            </div>
            
            <div className="flex flex-col gap-4 mb-16">
              {/* Derive effective stock: use selected colour's stock if variants exist */}
              {(() => {
                const effectiveStock = watch.colorVariants?.length > 0
                  ? (selectedColor?.countInStock ?? 0)
                  : watch.countInStock;
                return (
                  <>
                    <Button
                      onClick={handleAddToCart}
                      disabled={effectiveStock <= 0}
                      className="w-full py-5 text-xs font-bold bg-black text-white hover:bg-[var(--accent)] transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {effectiveStock > 0 ? 'Reserve Now' : 'Out of Stock'}
                    </Button>
                    <Button
                      onClick={handleBuyNow}
                      disabled={effectiveStock <= 0}
                      variant="outline"
                      className="w-full py-5 text-xs font-bold border-black/10 hover:border-black disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Purchase Instantly
                    </Button>
                    {effectiveStock <= 0 && (
                      <p className="text-[10px] uppercase tracking-widest text-rose-500 font-bold text-center">
                        {watch.colorVariants?.length > 0
                          ? `${selectedColor?.name || 'This colour'} is currently decommissioned from the vault.`
                          : 'This asset is currently decommissioned from the vault.'}
                      </p>
                    )}
                  </>
                );
              })()}
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

        {/* Reviews Section */}
        <div className="mt-24 border-t border-gray-100 pt-16 fade-in">
          <div className="flex items-center gap-3 mb-10">
            <MessageSquare className="w-6 h-6 text-[var(--accent)]" />
            <h3 className="text-2xl font-bold uppercase tracking-widest text-black">Client Perspectives</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Reviews List */}
            <div className="flex flex-col gap-6">
              {reviews && reviews.length === 0 && (
                <div className="bg-[var(--bg-soft)] p-8 text-center text-gray-500 text-sm tracking-wide">
                  Be the first to share your experience with this timepiece.
                </div>
              )}
              {reviews && reviews.map((review) => (
                <div key={review._id} className="bg-white border p-6 hover:shadow-lg transition-shadow duration-300">
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold uppercase">
                         {review.userId?.name?.charAt(0) || 'G'}
                       </div>
                       <div>
                         <h5 className="text-xs font-bold tracking-widest uppercase">{review.userId?.name || 'Client'}</h5>
                         <span className="text-[10px] text-gray-400 tracking-wider block mt-1">{new Date(review.createdAt).toLocaleDateString()}</span>
                       </div>
                     </div>
                     <div className="flex items-center gap-1 bg-[var(--bg-soft)] px-3 py-1 rounded-full">
                       {[...Array(5)].map((_, i) => (
                         <Star 
                           key={i} 
                           className={`w-3 h-3 ${i < review.rating ? 'text-[var(--accent)] fill-[var(--accent)]' : 'text-gray-300'}`} 
                         />
                       ))}
                     </div>
                   </div>
                   <p className="text-sm text-gray-600 leading-relaxed font-light">{review.comment}</p>
                </div>
              ))}
            </div>

            {/* Write Review */}
            <div>
              <div className="bg-[var(--bg-soft)] p-8">
                <h4 className="text-sm uppercase tracking-[0.2em] font-bold text-black mb-6">Leave Your Impressions</h4>
                
                {user ? (
                  <form onSubmit={handleReviewSubmit} className="flex flex-col gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-3 font-bold">Heritage Rating</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className="focus:outline-none hover:scale-110 transition-transform"
                          >
                            <Star 
                              fill={star <= rating ? 'var(--accent)' : 'none'} 
                              className={`w-8 h-8 cursor-pointer ${star <= rating ? 'text-[var(--accent)]' : 'text-gray-300'}`} 
                            />
                          </button>
                        ))}
                        <span className="ml-3 text-xs text-gray-400 tracking-wider">
                           {rating > 0 && `${rating} Star${rating > 1 ? 's' : ''}`}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-3 font-bold">Your Narrative</label>
                        <textarea 
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows="4" 
                          required
                          placeholder="Describe your experience with this timepiece..."
                          className="w-full bg-white border border-gray-200 focus:border-black p-4 text-sm text-black font-light outline-none transition-colors resize-none placeholder:text-gray-400"
                        ></textarea>
                    </div>

                    <Button type="submit" className="w-full text-xs py-4 font-bold bg-black text-white hover:bg-[var(--accent)] transition-colors">
                      Submit Perspective
                    </Button>
                  </form>
                ) : (
                  <div className="text-center py-10 bg-white">
                    <p className="text-sm font-light text-gray-500 mb-6">You must be documented to leave a perspective.</p>
                    <Link to="/auth?mode=login">
                      <Button variant="outline" className="text-xs py-3 border-black/10 hover:border-black font-bold">Authenticate Now</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </Container>
    </div>
  );
};

export default ProductDetail;
