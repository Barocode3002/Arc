import { useState, useEffect } from 'react'
import { Plus, Package, RefreshCw, AlertTriangle, TrendingDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useInventory } from '../../hooks/useInventory'
import { useStaff } from '../../hooks/useStaff'
import { DEFAULT_CAFE_ID, formatCurrency, formatDate, getTodayDate, isLowStock, cn } from '../../utils/helpers'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'

export default function Inventory() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('stock')
  const {
    items,
    transactions,
    purchases,
    loading,
    error,
    fetchItems,
    addItem,
    fetchTransactions,
    addTransaction,
    fetchPurchases,
    addPurchase,
  } = useInventory(DEFAULT_CAFE_ID)

  const { employees, fetchEmployees } = useStaff(DEFAULT_CAFE_ID)

  const [itemModalOpen, setItemModalOpen] = useState(false)
  const [transactionModalOpen, setTransactionModalOpen] = useState(false)
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false)

  const [itemForm, setItemForm] = useState({ name: '', unit: 'kg', min_stock: 0, current_stock: 0 })
  const [transactionForm, setTransactionForm] = useState({ item_id: '', type: 'in', quantity: '', note: '', employee_id: '', date: getTodayDate() })
  const [purchaseForm, setPurchaseForm] = useState({ item_id: '', quantity: '', unit_cost: '', supplier_name: '', date: getTodayDate() })

  useEffect(() => {
    fetchItems()
    fetchEmployees(true)
  }, [fetchItems, fetchEmployees])

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions()
    } else if (activeTab === 'purchases') {
      fetchPurchases()
    }
  }, [activeTab, fetchTransactions, fetchPurchases])

  const handleCreateItem = async (e) => {
    e.preventDefault()
    const payload = {
      ...itemForm,
      min_stock: parseFloat(itemForm.min_stock),
      current_stock: parseFloat(itemForm.current_stock),
    }
    await addItem(payload)
    setItemModalOpen(false)
    setItemForm({ name: '', unit: 'kg', min_stock: 0, current_stock: 0 })
  }

  const handleCreateTransaction = async (e) => {
    e.preventDefault()
    const payload = {
      ...transactionForm,
      quantity: parseFloat(transactionForm.quantity),
      employee_id: transactionForm.employee_id || null,
    }
    await addTransaction(payload)
    setTransactionModalOpen(false)
    setTransactionForm({ item_id: '', type: 'in', quantity: '', note: '', employee_id: '', date: getTodayDate() })
  }

  const handleCreatePurchase = async (e) => {
    e.preventDefault()
    const payload = {
      ...purchaseForm,
      quantity: parseFloat(purchaseForm.quantity),
      unit_cost: parseFloat(purchaseForm.unit_cost),
    }
    await addPurchase(payload)
    setPurchaseModalOpen(false)
    setPurchaseForm({ item_id: '', quantity: '', unit_cost: '', supplier_name: '', date: getTodayDate() })
  }

  const lowStockCount = items.filter((i) => isLowStock(i.current_stock, i.min_stock)).length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-900">{t('admin.inventory.title')}</h1>
          <p className="text-sm text-brand-500 mt-1">{t('admin.inventory.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'stock' && (
            <Button variant="primary" size="sm" onClick={() => setItemModalOpen(true)}>
              <Plus className="h-4 w-4" /> {t('admin.inventory.add_item')}
            </Button>
          )}
          {activeTab === 'transactions' && (
            <Button variant="primary" size="sm" onClick={() => setTransactionModalOpen(true)}>
              <Plus className="h-4 w-4" /> {t('admin.inventory.log_transaction')}
            </Button>
          )}
          {activeTab === 'purchases' && (
            <Button variant="primary" size="sm" onClick={() => setPurchaseModalOpen(true)}>
              <Plus className="h-4 w-4" /> {t('admin.inventory.log_purchase')}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-brand-200">
        <nav className="flex gap-6">
          {[
            { id: 'stock', label: t('admin.inventory.tabs.stock') },
            { id: 'transactions', label: t('admin.inventory.tabs.transactions') },
            { id: 'purchases', label: t('admin.inventory.tabs.purchases') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'pb-4 text-sm font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-all',
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-900'
                  : 'border-transparent text-brand-400 hover:text-brand-600'
              )}
            >
              {tab.label}
              {tab.id === 'stock' && lowStockCount > 0 && (
                <span className="ms-2 px-2 py-0.5 rounded-full text-xxs font-bold bg-danger-500 text-white">
                  {lowStockCount} {t('admin.inventory.alert')}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {error && (
        <div className="p-4 bg-danger-50 text-danger-700 rounded-lg text-sm">
          {t('admin.inventory.error')} {error}
        </div>
      )}

      {/* TAB 1: Stock Levels */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <Card padding={false} className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-start text-sm">
                <thead className="bg-brand-900 text-white text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">{t('admin.inventory.stock_table.item')}</th>
                    <th className="px-6 py-4">{t('admin.inventory.stock_table.unit')}</th>
                    <th className="px-6 py-4">{t('admin.inventory.stock_table.current')}</th>
                    <th className="px-6 py-4">{t('admin.inventory.stock_table.min')}</th>
                    <th className="px-6 py-4">{t('admin.inventory.stock_table.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100 bg-white">
                  {items.map((item) => {
                    const low = isLowStock(item.current_stock, item.min_stock)
                    return (
                      <tr key={item.id} className={cn('hover:bg-brand-50/20 transition-colors', low && 'bg-danger-50/30')}>
                        <td className="px-6 py-4 font-semibold text-brand-900">{item.name}</td>
                        <td className="px-6 py-4 text-brand-600 font-medium capitalize">{item.unit}</td>
                        <td className={cn('px-6 py-4 font-bold text-lg', low ? 'text-danger-600' : 'text-brand-900')}>
                          {item.current_stock}
                        </td>
                        <td className="px-6 py-4 text-brand-500 font-medium">{item.min_stock}</td>
                        <td className="px-6 py-4">
                          {low ? (
                            <Badge variant="danger" dot>{t('admin.inventory.low_stock_warning')}</Badge>
                          ) : (
                            <Badge variant="success" dot>{t('admin.inventory.healthy')}</Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {!loading && items.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-10 text-brand-400">
                        {t('admin.inventory.no_items')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Transactions — fixed: renamed map variable from (t) to (txn) */}
      {activeTab === 'transactions' && (
        <Card padding={false} className="overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-start text-sm">
              <thead className="bg-brand-900 text-white text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">{t('admin.inventory.transactions_table.date')}</th>
                  <th className="px-6 py-4">{t('admin.inventory.transactions_table.item')}</th>
                  <th className="px-6 py-4">{t('admin.inventory.transactions_table.type')}</th>
                  <th className="px-6 py-4">{t('admin.inventory.transactions_table.quantity')}</th>
                  <th className="px-6 py-4">{t('admin.inventory.transactions_table.notes')}</th>
                  <th className="px-6 py-4">{t('admin.inventory.transactions_table.logged_by')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100 bg-white">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-brand-50/10 transition-colors">
                    <td className="px-6 py-4 text-brand-600 font-mono">
                      {formatDate(txn.date)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-brand-900">
                      {txn.inventory_items?.name || t('admin.inventory.deleted_item')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={txn.type === 'in' ? 'success' : 'danger'}>
                        {txn.type.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 font-bold text-brand-950">
                      {txn.quantity}
                    </td>
                    <td className="px-6 py-4 text-brand-500 italic max-w-xs truncate">
                      {txn.note || '-'}
                    </td>
                    <td className="px-6 py-4 text-brand-600">
                      {txn.employees?.name || t('admin.inventory.system_vendor')}
                    </td>
                  </tr>
                ))}
                {!loading && transactions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-brand-400">
                      {t('admin.inventory.no_transactions')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: Purchases */}
      {activeTab === 'purchases' && (
        <Card padding={false} className="overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-start text-sm">
              <thead className="bg-brand-900 text-white text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">{t('admin.inventory.purchases_table.date')}</th>
                  <th className="px-6 py-4">{t('admin.inventory.purchases_table.item')}</th>
                  <th className="px-6 py-4">{t('admin.inventory.purchases_table.quantity')}</th>
                  <th className="px-6 py-4">{t('admin.inventory.purchases_table.unit_cost')}</th>
                  <th className="px-6 py-4">{t('admin.inventory.purchases_table.total_cost')}</th>
                  <th className="px-6 py-4">{t('admin.inventory.purchases_table.supplier')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100 bg-white">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-brand-50/10 transition-colors">
                    <td className="px-6 py-4 text-brand-600 font-mono">
                      {formatDate(purchase.date)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-brand-900">
                      {purchase.inventory_items?.name || t('admin.inventory.deleted_item')}
                    </td>
                    <td className="px-6 py-4 font-bold text-brand-950">
                      {purchase.quantity}
                    </td>
                    <td className="px-6 py-4 text-brand-600">
                      {formatCurrency(purchase.unit_cost)}
                    </td>
                    <td className="px-6 py-4 font-bold text-brand-900">
                      {formatCurrency(purchase.total_cost)}
                    </td>
                    <td className="px-6 py-4 text-brand-600">
                      {purchase.supplier_name}
                    </td>
                  </tr>
                ))}
                {!loading && purchases.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-brand-400">
                      {t('admin.inventory.no_purchases')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Item Modal */}
      <Modal open={itemModalOpen} onClose={() => setItemModalOpen(false)} title={t('admin.inventory.item_modal.title')}>
        <form onSubmit={handleCreateItem} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('admin.inventory.item_modal.item_name')}
              placeholder={t('admin.inventory.item_modal.item_placeholder')}
              required
              value={itemForm.name}
              onChange={(e) => setItemForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Select
              label={t('admin.inventory.item_modal.unit')}
              value={itemForm.unit}
              onChange={(e) => setItemForm((prev) => ({ ...prev, unit: e.target.value }))}
              options={['kg', 'liter', 'piece', 'box']}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('admin.inventory.item_modal.starting_stock')}
              type="number"
              required
              min="0"
              value={itemForm.current_stock}
              onChange={(e) => setItemForm((prev) => ({ ...prev, current_stock: e.target.value }))}
            />
            <Input
              label={t('admin.inventory.item_modal.min_threshold')}
              type="number"
              required
              min="0"
              value={itemForm.min_stock}
              onChange={(e) => setItemForm((prev) => ({ ...prev, min_stock: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-brand-100">
            <Button variant="ghost" type="button" onClick={() => setItemModalOpen(false)}>
              {t('admin.inventory.item_modal.cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {t('admin.inventory.item_modal.save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Log Transaction Modal */}
      <Modal open={transactionModalOpen} onClose={() => setTransactionModalOpen(false)} title={t('admin.inventory.transaction_modal.title')}>
        <form onSubmit={handleCreateTransaction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('admin.inventory.transaction_modal.select_item')}
              required
              value={transactionForm.item_id}
              onChange={(e) => setTransactionForm((prev) => ({ ...prev, item_id: e.target.value }))}
              options={items.map((i) => ({ value: i.id, label: i.name }))}
              placeholder={t('admin.inventory.transaction_modal.choose_item')}
            />
            <Select
              label={t('admin.inventory.transaction_modal.type')}
              value={transactionForm.type}
              onChange={(e) => setTransactionForm((prev) => ({ ...prev, type: e.target.value }))}
              options={[
                { value: 'in', label: t('admin.inventory.transaction_modal.stock_in') },
                { value: 'out', label: t('admin.inventory.transaction_modal.stock_out') },
              ]}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label={t('admin.inventory.transaction_modal.quantity')}
              type="number"
              step="0.01"
              required
              placeholder={t('admin.inventory.transaction_modal.quantity_placeholder')}
              value={transactionForm.quantity}
              onChange={(e) => setTransactionForm((prev) => ({ ...prev, quantity: e.target.value }))}
            />
            <Select
              label={t('admin.inventory.transaction_modal.employee')}
              value={transactionForm.employee_id}
              onChange={(e) => setTransactionForm((prev) => ({ ...prev, employee_id: e.target.value }))}
              options={employees.map((emp) => ({ value: emp.id, label: emp.name }))}
              placeholder={t('admin.inventory.transaction_modal.employee_placeholder')}
            />
            <Input
              label={t('admin.inventory.transaction_modal.date')}
              type="date"
              required
              value={transactionForm.date}
              onChange={(e) => setTransactionForm((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <Input
            label={t('admin.inventory.transaction_modal.notes')}
            placeholder={t('admin.inventory.transaction_modal.notes_placeholder')}
            value={transactionForm.note}
            onChange={(e) => setTransactionForm((prev) => ({ ...prev, note: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-4 border-t border-brand-100">
            <Button variant="ghost" type="button" onClick={() => setTransactionModalOpen(false)}>
              {t('admin.inventory.transaction_modal.cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {t('admin.inventory.transaction_modal.save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Log Purchase Modal */}
      <Modal open={purchaseModalOpen} onClose={() => setPurchaseModalOpen(false)} title={t('admin.inventory.purchase_modal.title')}>
        <form onSubmit={handleCreatePurchase} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label={t('admin.inventory.purchase_modal.select_item')}
              required
              value={purchaseForm.item_id}
              onChange={(e) => setPurchaseForm((prev) => ({ ...prev, item_id: e.target.value }))}
              options={items.map((i) => ({ value: i.id, label: i.name }))}
              placeholder={t('admin.inventory.purchase_modal.choose_item')}
            />
            <Input
              label={t('admin.inventory.purchase_modal.supplier')}
              placeholder={t('admin.inventory.purchase_modal.supplier_placeholder')}
              required
              value={purchaseForm.supplier_name}
              onChange={(e) => setPurchaseForm((prev) => ({ ...prev, supplier_name: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label={t('admin.inventory.purchase_modal.quantity')}
              type="number"
              step="0.01"
              required
              placeholder={t('admin.inventory.purchase_modal.quantity_placeholder')}
              value={purchaseForm.quantity}
              onChange={(e) => setPurchaseForm((prev) => ({ ...prev, quantity: e.target.value }))}
            />
            <Input
              label={t('admin.inventory.purchase_modal.unit_cost')}
              type="number"
              step="0.01"
              required
              placeholder={t('admin.inventory.purchase_modal.unit_cost_placeholder')}
              value={purchaseForm.unit_cost}
              onChange={(e) => setPurchaseForm((prev) => ({ ...prev, unit_cost: e.target.value }))}
            />
            <Input
              label={t('admin.inventory.purchase_modal.date')}
              type="date"
              required
              value={purchaseForm.date}
              onChange={(e) => setPurchaseForm((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div className="bg-brand-50 p-3 rounded-lg border border-brand-100 flex items-center justify-between">
            <span className="text-xs text-brand-500 font-medium">{t('admin.inventory.purchase_modal.estimated_total')}</span>
            <span className="text-sm font-bold text-brand-900">
              {formatCurrency((purchaseForm.quantity || 0) * (purchaseForm.unit_cost || 0))}
            </span>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-brand-100">
            <Button variant="ghost" type="button" onClick={() => setPurchaseModalOpen(false)}>
              {t('admin.inventory.purchase_modal.cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {t('admin.inventory.purchase_modal.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}