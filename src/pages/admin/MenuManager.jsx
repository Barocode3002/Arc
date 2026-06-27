import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit2, Trash2, Eye, QrCode, Power, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useMenu } from '../../hooks/useMenu'
import { supabase } from '../../lib/supabase'
import { DEFAULT_CAFE_ID, formatCurrency, cn, menuBadgeVariant } from '../../utils/helpers'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea, Select } from '../../components/ui/Input'
import { QRCodeSVG } from 'qrcode.react'

export default function MenuManager() {
  const { t } = useTranslation()
  const {
    items,
    loading,
    error,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    toggleAvailability,
  } = useMenu(DEFAULT_CAFE_ID)

  const [slug, setSlug] = useState('arc-downtown')
  const [filterCategory, setFilterCategory] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    category: '',
    name: '',
    description: '',
    price: '',
    badge: '',
    sort_order: 0,
    is_available: true,
  })

  useEffect(() => {
    fetchItems()
    // Load cafe slug
    async function loadCafe() {
      const { data } = await supabase
        .from('cafes')
        .select('slug')
        .eq('id', DEFAULT_CAFE_ID)
        .single()
      if (data?.slug) {
        setSlug(data.slug)
      }
    }
    loadCafe()
  }, [fetchItems])

  const categories = useMemo(() => {
    const cats = items.map((i) => i.category)
    return [...new Set(cats)]
  }, [items])

  const filteredItems = useMemo(() => {
    if (!filterCategory) return items
    return items.filter((i) => i.category === filterCategory)
  }, [items, filterCategory])

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({
      category: '',
      name: '',
      description: '',
      price: '',
      badge: '',
      sort_order: items.length + 1,
      is_available: true,
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setFormData({
      category: item.category,
      name: item.name,
      description: item.description || '',
      price: item.price,
      badge: item.badge || '',
      sort_order: item.sort_order,
      is_available: item.is_available,
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      sort_order: parseInt(formData.sort_order),
      badge: formData.badge || null,
    }

    let success
    if (editingItem) {
      success = await updateItem(editingItem.id, payload)
    } else {
      success = await addItem(payload)
    }
    
    if (success) {
      setModalOpen(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.menu_manager.delete_confirm'))) {
      await deleteItem(id)
    }
  }

  const publicMenuUrl = `${window.location.origin}/${slug}/menu`

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-900">{t('admin.menu_manager.title')}</h1>
          <p className="text-sm text-brand-500 mt-1">{t('admin.menu_manager.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <a href={publicMenuUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary" size="sm">
              <Eye className="h-4 w-4" /> {t('admin.menu_manager.live_menu')}
            </Button>
          </a>
          <Button variant="primary" size="sm" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4" /> {t('admin.menu_manager.add_item')}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-700 p-4 rounded-lg text-sm flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">{t('admin.menu_manager.error_title')}</p>
            <p>{error}</p>
            <p className="mt-2 text-xs opacity-80">{t('admin.menu_manager.error_hint')}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left main: menu list */}
        <div className="lg:col-span-3 space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilterCategory('')}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap',
                !filterCategory
                  ? 'bg-brand-600 border-brand-600 text-white'
                  : 'bg-white border-brand-200 text-brand-700 hover:bg-brand-50'
              )}
            >
              {t('admin.menu_manager.all_categories')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={cn(
                  'px-4 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap',
                  filterCategory === cat
                    ? 'bg-brand-600 border-brand-600 text-white'
                    : 'bg-white border-brand-200 text-brand-700 hover:bg-brand-50'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <Card padding={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-start text-sm">
                <thead className="bg-brand-900 text-white text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">{t('admin.menu_manager.table.name')}</th>
                    <th className="px-6 py-4">{t('admin.menu_manager.table.category')}</th>
                    <th className="px-6 py-4">{t('admin.menu_manager.table.price')}</th>
                    <th className="px-6 py-4">{t('admin.menu_manager.table.order')}</th>
                    <th className="px-6 py-4">{t('admin.menu_manager.table.status')}</th>
                    <th className="px-6 py-4 text-end">{t('admin.menu_manager.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100 bg-white">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-brand-50/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-brand-900">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-brand-500 line-clamp-1 mt-0.5">{item.description}</div>
                        )}
                        {item.badge && (
                          <Badge variant={menuBadgeVariant(item.badge)} className="mt-1">
                            {item.badge}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-brand-700 font-medium">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 font-bold text-brand-950">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4 text-brand-500">
                        {item.sort_order}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleAvailability(item.id, item.is_available)}
                          className="cursor-pointer"
                        >
                          <Badge variant={item.is_available ? 'success' : 'danger'} dot>
                            {item.is_available ? t('admin.menu_manager.available') : t('admin.menu_manager.unavailable')}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-end space-x-1 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2 py-1 text-brand-600"
                          onClick={() => handleOpenEdit(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2 py-1 text-danger-500 hover:text-danger-700"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {!loading && filteredItems.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-brand-400">
                        {t('admin.menu_manager.no_items')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right sidebar: QR Preview */}
        <div className="lg:col-span-1">
          <Card title={t('admin.menu_manager.qr_title')} subtitle={t('admin.menu_manager.qr_subtitle')}>
            <div className="flex flex-col items-center justify-center p-4 border border-dashed border-brand-200 rounded-xl bg-brand-50/30">
              <QRCodeSVG value={publicMenuUrl} size={150} fgColor="#2C1A0E" />
              <p className="text-xs text-brand-500 mt-4 text-center font-mono break-all px-2">
                {publicMenuUrl}
              </p>
              <p className="text-xs font-semibold text-brand-700 mt-2">
                {t('admin.menu_manager.qr_print')}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? t('admin.menu_manager.modal.edit_title') : t('admin.menu_manager.modal.add_title')}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('admin.menu_manager.modal.item_name')}
              placeholder={t('admin.menu_manager.modal.item_name_placeholder')}
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              label={t('admin.menu_manager.modal.category')}
              placeholder={t('admin.menu_manager.modal.category_placeholder')}
              required
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
            />
          </div>

          <Textarea
            label={t('admin.menu_manager.modal.description')}
            placeholder={t('admin.menu_manager.modal.description_placeholder')}
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label={t('admin.menu_manager.modal.price')}
              type="number"
              step="0.01"
              required
              placeholder={t('admin.menu_manager.modal.price_placeholder')}
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
            />
            <Select
              label={t('admin.menu_manager.modal.badge')}
              value={formData.badge}
              onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value }))}
              options={[
                { value: '', label: t('admin.menu_manager.modal.badge_none') },
                { value: 'bestseller', label: t('admin.menu_manager.modal.badge_bestseller') },
                { value: 'signature', label: t('admin.menu_manager.modal.badge_signature') },
                { value: 'seasonal', label: t('admin.menu_manager.modal.badge_seasonal') },
              ]}
            />
            <Input
              label={t('admin.menu_manager.modal.sort_order')}
              type="number"
              required
              value={formData.sort_order}
              onChange={(e) => setFormData((prev) => ({ ...prev, sort_order: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_available"
              className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4 cursor-pointer"
              checked={formData.is_available}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_available: e.target.checked }))}
            />
            <label htmlFor="is_available" className="text-sm font-medium text-brand-700 cursor-pointer">
              {t('admin.menu_manager.modal.available_label')}
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-brand-100">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              {t('admin.menu_manager.modal.cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {t('admin.menu_manager.modal.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
