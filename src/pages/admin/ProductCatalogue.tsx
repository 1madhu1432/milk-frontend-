import React, { useState } from 'react';
import { useDairy } from '../../contexts/DairyContext';
import { Product } from '../../models/types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import {
  PackageCheck,
  Plus,
  Search,
  Filter,
  Edit,
  AlertTriangle,
  Boxes,
  CheckCircle2,
} from 'lucide-react';

export const ProductCatalogue: React.FC = () => {
  const { products, addProduct, updateProduct } = useDairy();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'Dairy Essentials',
    description: '',
    image: '🧈',
    unitOrPackageSize: '250g',
    purchaseCost: 80,
    sellingPrice: 120,
    availableStock: 50,
    minimumStock: 15,
    isRecurringEligible: true,
    status: 'active',
  });

  const categories = ['ALL', 'Fresh Milk', 'Dairy Essentials', 'Cultured', 'Beverages'];

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Dairy Essentials',
      description: '',
      image: '🧈',
      unitOrPackageSize: '250g',
      purchaseCost: 80,
      sellingPrice: 120,
      availableStock: 50,
      minimumStock: 15,
      isRecurringEligible: true,
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData(prod);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert('Please provide product name.');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
      alert('Product updated successfully!');
    } else {
      addProduct({
        name: formData.name!,
        category: formData.category as any,
        description: formData.description || '',
        image: formData.image || '🥛',
        unitOrPackageSize: formData.unitOrPackageSize || '1 Pack',
        purchaseCost: Number(formData.purchaseCost),
        sellingPrice: Number(formData.sellingPrice),
        availableStock: Number(formData.availableStock),
        minimumStock: Number(formData.minimumStock),
        isRecurringEligible: formData.isRecurringEligible || false,
        status: 'active',
      });
      alert('Product created!');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#17211B] flex items-center gap-2">
            Dairy Products Catalogue
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              {products.length} Products Live
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure fresh farm milk, paneer, desi ghee, cultured curd, and butter packaging & pricing
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Category Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16803D]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#EAF7EE] text-[#14532D] border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProducts.map(p => {
          const isLowStock = p.availableStock <= p.minimumStock;
          const margin = p.sellingPrice - p.purchaseCost;
          const marginPct = Math.round((margin / p.sellingPrice) * 100);

          return (
            <div
              key={p.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow ${
                isLowStock ? 'border-amber-300' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="w-12 h-12 rounded-xl bg-[#F7F9F7] flex items-center justify-center text-3xl border border-slate-100 shadow-xs">
                    {p.image}
                  </span>
                  <Badge variant={p.status === 'active' ? 'green' : 'amber'}>
                    {p.status}
                  </Badge>
                </div>

                <div className="mt-4">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    {p.category}
                  </span>
                  <h3 className="font-bold text-sm text-[#17211B] mt-0.5">{p.name}</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{p.unitOrPackageSize}</p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                </div>

                {/* Price and Stock Stats */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Selling Price
                    </span>
                    <span className="text-base font-extrabold text-[#14532D]">
                      {formatCurrency(p.sellingPrice)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Cost: ₹{p.purchaseCost} ({marginPct}% margin)
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Stock Level
                    </span>
                    <span
                      className={`text-base font-extrabold ${
                        isLowStock ? 'text-rose-700' : 'text-slate-800'
                      }`}
                    >
                      {p.availableStock} Units
                    </span>
                    {isLowStock && (
                      <span className="text-[10px] text-rose-600 font-bold block flex items-center justify-end gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> Low Stock!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {p.isRecurringEligible ? 'Daily / Recurring' : 'On-Demand Only'}
                </span>
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Product</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit Product: ${editingProduct.name}` : 'Create New Product'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="Fresh Milk">Fresh Milk</option>
                <option value="Dairy Essentials">Dairy Essentials</option>
                <option value="Cultured">Cultured</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Package Size / Unit</label>
              <input
                type="text"
                required
                value={formData.unitOrPackageSize || ''}
                onChange={e => setFormData({ ...formData, unitOrPackageSize: e.target.value })}
                placeholder="e.g. 500g Tub, 1 Litre"
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Production / Cost Price (₹)</label>
              <input
                type="number"
                value={formData.purchaseCost}
                onChange={e => setFormData({ ...formData, purchaseCost: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                required
                value={formData.sellingPrice}
                onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Available Stock Units</label>
              <input
                type="number"
                value={formData.availableStock}
                onChange={e => setFormData({ ...formData, availableStock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Low Stock Warning Threshold</label>
              <input
                type="number"
                value={formData.minimumStock}
                onChange={e => setFormData({ ...formData, minimumStock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#16803D] hover:bg-[#14532D] text-white rounded-lg font-semibold"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
