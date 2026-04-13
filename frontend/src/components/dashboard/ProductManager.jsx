import React, { useState } from 'react';
import { Plus, Trash2, Edit, XCircle } from 'lucide-react';
import { getImageUrl } from '@/utils/image';

const ProductManager = ({ products, dispatch, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'luxury',
    price: '',
    description: '',
    targetAudience: 'Unisex',
    countInStock: 0,
    returnAvailable: false,
    returnDays: 0,
    returnHours: 0,
    caseDiameter: '',
    bandMaterial: '',
    movementType: '',
    itemWeight: '',
    countryOfOrigin: 'Hong Kong',
  });
  // colorVariants: [{ name, hex, imageFiles: [], imagePreviews: [], existingImages: [] }]
  const [colorVariants, setColorVariants] = useState([]);
  const [defaultImageFiles, setDefaultImageFiles] = useState([]);
  const [defaultImagePreviews, setDefaultImagePreviews] = useState([]);

  const handleEdit = (product) => {
    setIsAdding(true);
    setEditingId(product._id);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      targetAudience: product.targetAudience || 'Unisex',
      description: product.description || '',
      countInStock: product.countInStock || 0,
      returnAvailable: product.returnAvailable || false,
      returnDays: product.returnDays || 0,
      returnHours: product.returnHours || 0,
      caseDiameter: product.caseDiameter || '',
      bandMaterial: product.bandMaterial || '',
      movementType: product.movementType || '',
      itemWeight: product.itemWeight || '',
      countryOfOrigin: product.countryOfOrigin || 'Hong Kong',
    });
    // Load existing color variants
    const existingVariants = (product.colorVariants || []).map(v => ({
      name: v.name,
      hex: v.hex || '#000000',
      countInStock: v.countInStock || 0,
      imageFiles: [],
      imagePreviews: (v.images || []).map(img => getImageUrl(img)),
      existingImages: v.images || []
    }));
    setColorVariants(existingVariants);
    // Default images
    const defImgs = (product.images || (product.image ? [product.image] : [])).map(img => getImageUrl(img));
    setDefaultImagePreviews(defImgs);
    setDefaultImageFiles([]);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      name: '', category: 'luxury', targetAudience: 'Unisex', price: '', description: '',
      countInStock: 0, returnAvailable: false, returnDays: 0, returnHours: 0,
      caseDiameter: '', bandMaterial: '', movementType: '', itemWeight: '', countryOfOrigin: 'Hong Kong',
    });
    setColorVariants([]);
    setDefaultImageFiles([]);
    setDefaultImagePreviews([]);
  };

  const addColorVariant = () => {
    setColorVariants(prev => [...prev, { name: '', hex: '#C9A44C', countInStock: 0, imageFiles: [], imagePreviews: [], existingImages: [] }]);
  };

  const removeColorVariant = (idx) => {
    setColorVariants(prev => prev.filter((_, i) => i !== idx));
  };

  const updateVariantField = (idx, field, value) => {
    setColorVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };

  const handleVariantImages = (idx, e) => {
    const newFiles = Array.from(e.target.files);
    setColorVariants(prev => prev.map((v, i) => {
      if (i !== idx) return v;
      const updatedFiles = [...v.imageFiles, ...newFiles].slice(0, 5);
      const newPreviews = newFiles.map(f => URL.createObjectURL(f));
      const updatedPreviews = [...v.imagePreviews, ...newPreviews].slice(0, 5);
      return { ...v, imageFiles: updatedFiles, imagePreviews: updatedPreviews };
    }));
  };

  const removeVariantImage = (variantIdx, imgIdx) => {
    setColorVariants(prev => prev.map((v, i) => {
      if (i !== variantIdx) return v;
      const previews = v.imagePreviews.filter((_, pi) => pi !== imgIdx);
      const files = v.imageFiles.filter((_, fi) => fi !== imgIdx);
      const existing = v.existingImages.filter((_, ei) => ei !== imgIdx);
      return { ...v, imageFiles: files, imagePreviews: previews, existingImages: existing };
    }));
  };

  const handleDefaultImageChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setDefaultImageFiles(prev => [...prev, ...newFiles].slice(0, 5));
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setDefaultImagePreviews(prev => [...prev, ...newPreviews].slice(0, 5));
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('price', Number(formData.price));
    fd.append('category', formData.category);
    fd.append('targetAudience', formData.targetAudience);
    fd.append('description', formData.description);
    fd.append('countInStock', formData.countInStock);
    fd.append('returnAvailable', formData.returnAvailable);
    fd.append('returnDays', formData.returnDays);
    fd.append('returnHours', formData.returnHours);
    fd.append('caseDiameter', formData.caseDiameter);
    fd.append('bandMaterial', formData.bandMaterial);
    fd.append('movementType', formData.movementType);
    fd.append('itemWeight', formData.itemWeight);
    fd.append('countryOfOrigin', formData.countryOfOrigin);

    // Serialize colorVariants metadata (name, hex, countInStock, existing image paths)
    const variantsMetadata = colorVariants.map(v => ({
      name: v.name,
      hex: v.hex,
      countInStock: Number(v.countInStock) || 0,
      images: v.existingImages  // existing server paths preserved
    }));
    fd.append('colorVariants', JSON.stringify(variantsMetadata));

    // Append per-variant new image files
    colorVariants.forEach((v, idx) => {
      v.imageFiles.forEach(file => {
        fd.append(`colorImages_${idx}`, file);
      });
    });

    // Default images
    defaultImageFiles.forEach(file => fd.append('images', file));

    if (editingId) {
      dispatch(onUpdate({ id: editingId, data: fd }));
    } else {
      dispatch(onAdd(fd));
    }
    resetForm();
  };

  return (
    <div className="space-y-12 fade-in">
      <div className="flex justify-between items-end border-b border-gray-100 pb-10">
        <div>
           <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-2">Vault Registry</h3>
           <h2 className="text-2xl font-bold uppercase tracking-widest text-black">{editingId ? 'Modify Piece' : 'Inventory Asset Management'}</h2>
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="bg-black text-white px-8 py-4 text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[var(--accent)] transition-all duration-300 flex items-center gap-3">
            <Plus className="w-3 h-3" /> New Asset
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white border border-gray-100 p-12 relative">
          <button type="button" onClick={resetForm} className="absolute top-8 right-8 text-gray-300 hover:text-black transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
          
          <form onSubmit={handleAdd} className="space-y-12">
            {/* Row 1 — Basic Attributes + Default Images */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black border-b border-gray-50 pb-4">Essential Attributes</h3>
                
                <div className="space-y-6">
                  <div className="group">
                    <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Model Designation</label>
                    <input className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Chronos Legacy" required />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="group">
                      <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Valuation (Rs.)</label>
                      <input type="number" className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="00.00" required />
                    </div>
                    <div className="group">
                      <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Collection</label>
                      <select className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none cursor-pointer" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        <option value="luxury">Luxury Elite</option>
                        <option value="sport">Precision Sport</option>
                        <option value="classic">Heritage Classic</option>
                        <option value="smart">Digital Vanguard</option>
                      </select>
                    </div>
                    <div className="group">
                      <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Target Audience</label>
                      <select className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none cursor-pointer" value={formData.targetAudience} onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}>
                        {['Unisex', 'Men', 'Women', 'Boys', 'Girls'].map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Asset Narrative</label>
                    <textarea className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-medium text-black focus:outline-none focus:border-[var(--accent)] transition-colors h-32 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Detailed specifications and heritage..." />
                  </div>

                  {/* Technical Specifications */}
                  <div>
                    <h4 className="text-[9px] uppercase tracking-[0.25em] font-bold text-gray-400 mb-4 border-b border-gray-50 pb-2">Technical Specifications</h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                      <div className="group">
                        <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Case Diameter</label>
                        <input className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors" value={formData.caseDiameter} onChange={(e) => setFormData({...formData, caseDiameter: e.target.value})} placeholder="e.g. 42 mm" />
                      </div>
                      <div className="group">
                        <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Band Material</label>
                        <input className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors" value={formData.bandMaterial} onChange={(e) => setFormData({...formData, bandMaterial: e.target.value})} placeholder="e.g. Stainless Steel" />
                      </div>
                      <div className="group">
                        <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Movement Type</label>
                        <input className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors" value={formData.movementType} onChange={(e) => setFormData({...formData, movementType: e.target.value})} placeholder="e.g. Automatic" />
                      </div>
                      <div className="group">
                        <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Item Weight</label>
                        <input className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors" value={formData.itemWeight} onChange={(e) => setFormData({...formData, itemWeight: e.target.value})} placeholder="e.g. 120 g" />
                      </div>
                      <div className="group col-span-2">
                        <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Country of Origin</label>
                        <input className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors" value={formData.countryOfOrigin} onChange={(e) => setFormData({...formData, countryOfOrigin: e.target.value})} placeholder="e.g. Hong Kong" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black border-b border-gray-50 pb-4">Default Visuals & Stock</h3>
                
                <div className="group border-2 border-dashed border-gray-50 p-6 bg-[#FBFBFB]">
                  <p className="text-[8px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-4">Default Gallery (fallback images)</p>
                  <div className="flex flex-wrap gap-4 mb-4">
                    {defaultImagePreviews.map((prev, idx) => (
                      <div key={idx} className="w-20 h-20 border border-gray-100 bg-white p-2 relative group/item">
                         <img src={prev} className="w-full h-full object-contain" alt="" />
                         <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/item:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-[6px] text-white uppercase font-bold tracking-tighter">Primary</span>
                         </div>
                      </div>
                    ))}
                    {defaultImagePreviews.length < 5 && (
                      <label className="w-20 h-20 border-2 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-black transition-colors bg-white">
                        <Plus className="w-4 h-4 text-gray-300" />
                        <input type="file" multiple accept="image/*" onChange={handleDefaultImageChange} className="hidden" />
                      </label>
                    )}
                  </div>
                  <p className="text-[7px] uppercase tracking-[0.3em] text-gray-300 font-bold text-center">Stage up to 5 high-resolution visuals</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                    <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">
                      {colorVariants.length > 0 ? 'Total Stock (auto)' : 'Vault Quantity'}
                    </label>
                    {colorVariants.length > 0 ? (
                      <div className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-gray-400">
                        {colorVariants.reduce((s, v) => s + (Number(v.countInStock) || 0), 0)} units (sum of variants)
                      </div>
                    ) : (
                      <input type="number" className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors" value={formData.countInStock} onChange={(e) => setFormData({...formData, countInStock: e.target.value})} placeholder="0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                     <input type="checkbox" id="ret-av" checked={formData.returnAvailable} onChange={(e) => setFormData({...formData, returnAvailable: e.target.checked})} className="accent-black w-4 h-4 cursor-pointer" />
                     <label htmlFor="ret-av" className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 cursor-pointer">Escrow Protection</label>
                  </div>
                </div>

                {formData.returnAvailable && (
                  <div className="grid grid-cols-2 gap-6 slide-down">
                    <div className="group">
                      <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Return window (Days)</label>
                      <input type="number" className="w-full bg-[#FBFBFB] border-0 border-b border-gray-100 p-3 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors" value={formData.returnDays} onChange={(e) => setFormData({...formData, returnDays: e.target.value})} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2 — Color Variants */}
            <div className="border-t border-gray-100 pt-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-black">Colour Variants</h3>
                  <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-1 font-medium">Each colour can have its own name, hex code, and product photos</p>
                </div>
                <button
                  type="button"
                  onClick={addColorVariant}
                  className="flex items-center gap-2 bg-[#FBFBFB] border border-gray-100 text-black px-5 py-3 text-[8px] uppercase tracking-[0.2em] font-bold hover:bg-black hover:text-white transition-all duration-300"
                >
                  <Plus className="w-3 h-3" /> Add Colour
                </button>
              </div>

              {colorVariants.length === 0 && (
                <div className="border-2 border-dashed border-gray-100 p-10 text-center text-gray-300 text-[9px] uppercase tracking-[0.3em] font-bold">
                  No colour variants added yet — click "Add Colour" above
                </div>
              )}

              <div className="space-y-6">
                {colorVariants.map((variant, idx) => (
                  <div key={idx} className="border border-gray-100 p-6 bg-[#FBFBFB] relative group/variant">
                    <button
                      type="button"
                      onClick={() => removeColorVariant(idx)}
                      className="absolute top-4 right-4 text-gray-200 hover:text-rose-500 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                      {/* Colour Name */}
                      <div>
                        <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Colour Name</label>
                        <input
                          className="w-full bg-white border-0 border-b border-gray-200 p-2 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors"
                          value={variant.name}
                          onChange={(e) => updateVariantField(idx, 'name', e.target.value)}
                          placeholder="e.g. Midnight Black"
                          required
                        />
                      </div>

                      {/* Hex Picker */}
                      <div>
                        <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Hex Code</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={variant.hex}
                            onChange={(e) => updateVariantField(idx, 'hex', e.target.value)}
                            className="w-10 h-10 rounded-sm border border-gray-200 cursor-pointer p-0.5 bg-white"
                            title="Pick colour"
                          />
                          <input
                            className="flex-1 bg-white border-0 border-b border-gray-200 p-2 text-xs font-mono text-black focus:outline-none focus:border-[var(--accent)] transition-colors"
                            value={variant.hex}
                            onChange={(e) => updateVariantField(idx, 'hex', e.target.value)}
                            placeholder="#000000"
                          />
                          <div
                            className="w-8 h-8 rounded-full border border-gray-200 shadow-sm shrink-0"
                            style={{ backgroundColor: variant.hex }}
                          />
                        </div>
                      </div>

                      {/* Vault Qty per variant */}
                      <div>
                        <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-2 block">Vault Qty</label>
                        <input
                          type="number"
                          min="0"
                          className="w-full bg-white border-0 border-b border-gray-200 p-2 text-xs font-bold text-black focus:outline-none focus:border-[var(--accent)] transition-colors"
                          value={variant.countInStock}
                          onChange={(e) => updateVariantField(idx, 'countInStock', e.target.value)}
                          placeholder="0"
                        />
                      </div>

                      {/* Photo count */}
                      <div className="flex items-end">
                        <div className="text-[8px] uppercase tracking-[0.2em] text-gray-400 font-bold">
                          <span className="text-black text-sm font-bold">{variant.imagePreviews.length}</span> / 5 photos
                        </div>
                      </div>
                    </div>

                    {/* Variant Images */}
                    <div>
                      <label className="text-[8px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-3 block">Photos for this colour</label>
                      <div className="flex flex-wrap gap-3">
                        {variant.imagePreviews.map((prev, pi) => (
                          <div key={pi} className="relative w-20 h-20 border border-gray-200 bg-white p-1.5 group/img">
                            <img src={prev} className="w-full h-full object-contain" alt="" />
                            <button
                              type="button"
                              onClick={() => removeVariantImage(idx, pi)}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[8px] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity leading-none"
                            >×</button>
                          </div>
                        ))}
                        {variant.imagePreviews.length < 5 && (
                          <label className="w-20 h-20 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--accent)] transition-colors bg-white gap-1.5">
                            <Plus className="w-4 h-4 text-gray-300" />
                            <span className="text-[6px] uppercase text-gray-300 font-bold tracking-wider">Add Photo</span>
                            <input type="file" multiple accept="image/*" onChange={(e) => handleVariantImages(idx, e)} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button type="submit" className="w-full bg-black text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[var(--accent)] transition-all duration-500 shadow-xl">
                {editingId ? 'Authenticating Changes' : 'Legitimize Asset'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black">
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Asset</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Collection</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Audience</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Colours</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Valuation</th>
                <th className="p-6 text-left text-[9px] uppercase tracking-[0.3em] font-bold text-white border-r border-white/5">Vault</th>
                <th className="p-6 text-right text-[9px] uppercase tracking-[0.3em] font-bold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(product => (
                <tr key={product._id} className="group hover:bg-[#FBFBFB] transition-colors duration-300">
                  <td className="p-6">
                    <div className="flex items-center gap-6">
                       <div className="w-20 h-20 bg-[var(--bg-soft)] rounded-sm p-3 group-hover:scale-110 transition-transform duration-500">
                          <img src={getImageUrl(product.images?.[0] || product.image)} className="w-full h-full object-contain mix-blend-darken" alt={product.name} />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-black uppercase tracking-wider">{product.name}</p>
                          <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-1 font-bold">ID: {product._id.substring(0,10)}</p>
                       </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold px-3 py-1 border border-gray-100">{product.category}</span>
                  </td>
                  <td className="p-6">
                    <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold px-3 py-1 border border-gray-100">{product.targetAudience || 'Unisex'}</span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(product.colorVariants || []).length > 0 ? (
                        (product.colorVariants || []).map((cv, ci) => (
                          <div key={ci} title={cv.name} className="w-5 h-5 rounded-full border-2 border-white shadow-sm ring-1 ring-gray-200" style={{ backgroundColor: cv.hex || '#888' }} />
                        ))
                      ) : (
                        <span className="text-[8px] text-gray-300 uppercase tracking-widest font-bold">—</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="text-xs font-bold text-black tracking-widest">Rs. {product.price?.toLocaleString()}</p>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-2">
                       <div className="w-20 bg-gray-50 h-1 overflow-hidden">
                          <div className={`h-full ${product.countInStock < 5 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (product.countInStock/20)*100)}%` }} />
                       </div>
                       <p className="text-[8px] uppercase tracking-widest font-bold text-gray-400">{product.countInStock} Units Available</p>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(product)} className="p-3 text-gray-300 hover:text-black hover:bg-white transition-all duration-300 border border-transparent hover:border-gray-100">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { if(window.confirm('Decommission this asset?')) dispatch(onDelete(product._id)) }} className="p-3 text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-all duration-300 border border-transparent hover:border-rose-100">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="7" className="p-20 text-center text-gray-400 text-[10px] uppercase font-bold tracking-[0.3em]">No Assets Registered in Vault</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductManager;
