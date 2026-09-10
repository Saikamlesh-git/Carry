import React, { useState, useEffect } from 'react';
import {
  Plus,
  FolderTree,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Hash,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import CategoryModal from '../../components/admin/CategoryModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

export default function AdminCategories() {
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      addToast('Error loading categories.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateOrUpdate = async (catData) => {
    if (editingCategory) {
      const res = await api.put(`/admin/categories/${editingCategory.id}`, catData);
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCategory.id ? res.data : c))
      );
      addToast(`Category '${res.data.name}' updated.`);
    } else {
      const res = await api.post('/admin/categories', catData);
      setCategories((prev) => [...prev, res.data]);
      addToast(`Category '${res.data.name}' created.`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/admin/categories/${categoryToDelete.id}`);
      if (res.data.deactivated) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === categoryToDelete.id ? { ...c, is_active: false } : c
          )
        );
        addToast(res.data.message, 'info');
      } else {
        setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
        addToast(res.data.message, 'success');
      }
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    } catch (err) {
      addToast('Error deleting category.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async (cat) => {
    try {
      const nextState = !cat.is_active;
      const res = await api.put(`/admin/categories/${cat.id}`, {
        is_active: nextState,
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? res.data : c))
      );
      addToast(
        `Category '${cat.name}' is now ${nextState ? 'Active' : 'Inactive'}.`
      );
    } catch (err) {
      addToast('Error updating category status.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Category Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Configure hotel packaging product categories and store navigation display order
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setIsCategoryModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Display (Mobile Cards + Desktop Table) */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
          Loading categories...
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center text-slate-500">
          <FolderTree className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
          <p className="font-bold">No categories defined yet</p>
        </div>
      ) : (
        <>
          {/* Mobile Category Cards (< md) */}
          <div className="md:hidden space-y-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-100/80 text-teal-700 flex items-center justify-center flex-shrink-0">
                      <FolderTree className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">
                        {cat.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-slate-500">
                          <Hash className="w-2.5 h-2.5" />
                          Order {cat.display_order}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {cat.product_count} items
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleActive(cat)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                      cat.is_active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cat.is_active ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>Inactive</span>
                      </>
                    )}
                  </button>
                </div>

                {cat.description && (
                  <p className="text-xs text-slate-500 leading-relaxed pl-1">
                    {cat.description}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setEditingCategory(cat);
                      setIsCategoryModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      setCategoryToDelete(cat);
                      setDeleteConfirmOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (Hidden on mobile < md) */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                    <th className="px-6 py-3.5">Order</th>
                    <th className="px-6 py-3.5">Category Name</th>
                    <th className="px-6 py-3.5">Description</th>
                    <th className="px-6 py-3.5">Products</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                          <Hash className="w-3 h-3 text-slate-400" />
                          {cat.display_order}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-900">
                        {cat.name}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500 max-w-sm truncate">
                        {cat.description || '—'}
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700">
                          {cat.product_count} items
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(cat)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                            cat.is_active
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Click to toggle status"
                        >
                          {cat.is_active ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-slate-400" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingCategory(cat);
                              setIsCategoryModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setCategoryToDelete(cat);
                              setDeleteConfirmOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleCreateOrUpdate}
        category={editingCategory}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Category"
        message={`Are you sure you want to delete category "${categoryToDelete?.name}"? If it contains products, it will be safely deactivated.`}
        confirmText="Confirm Delete"
        loading={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
}
