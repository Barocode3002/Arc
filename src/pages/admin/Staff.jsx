import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit2, Trash2, CheckCircle2, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useStaff } from '../../hooks/useStaff'
import { DEFAULT_CAFE_ID, formatCurrency, cn } from '../../utils/helpers'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Select } from '../../components/ui/Input'

const roles = ['manager', 'barista', 'waiter', 'cashier']
const shifts = ['morning', 'evening', 'both']

export default function Staff() {
  const { t } = useTranslation()
  const {
    employees,
    loading,
    error,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    toggleActive,
    deleteEmployee,
  } = useStaff(DEFAULT_CAFE_ID)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [filterActive, setFilterActive] = useState('all')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'barista',
    salary: '',
    shift: 'morning',
  })

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const filteredEmployees = useMemo(() => {
    if (filterActive === 'active') return employees.filter((e) => e.is_active)
    if (filterActive === 'inactive') return employees.filter((e) => !e.is_active)
    return employees
  }, [employees, filterActive])

  const totalPayroll = useMemo(() => {
    return employees
      .filter((e) => e.is_active)
      .reduce((sum, e) => sum + (e.salary || 0), 0)
  }, [employees])

  const handleOpenAdd = () => {
    setEditingEmployee(null)
    setFormData({
      name: '',
      phone: '',
      role: 'barista',
      salary: '',
      shift: 'morning',
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      phone: employee.phone,
      role: employee.role,
      salary: employee.salary,
      shift: employee.shift,
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const payload = {
      ...formData,
      salary: parseFloat(formData.salary),
    }

    if (editingEmployee) {
      await updateEmployee(editingEmployee.id, payload)
    } else {
      await addEmployee(payload)
    }
    setModalOpen(false)
  }

  const handleDelete = async (employee) => {
    if (!window.confirm(t('admin.staff.delete_confirm', { name: employee.name }))) return
    await deleteEmployee(employee.id)
  }

  const getRoleVariant = (role) => {
    const map = {
      manager: 'success',
      barista: 'info',
      waiter: 'warning',
      cashier: 'neutral',
    }
    return map[role] || 'neutral'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-900">{t('admin.staff.title')}</h1>
          <p className="text-sm text-brand-500 mt-1">{t('admin.staff.subtitle')}</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenAdd}>
          <Plus className="h-4 w-4" /> {t('admin.staff.add_employee')}
        </Button>
      </div>

      {/* Stats and filters banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs text-brand-500 font-medium uppercase">{t('admin.staff.active_staff')}</p>
            <p className="text-2xl font-bold text-brand-900 mt-1">
              {employees.filter((e) => e.is_active).length} / {employees.length}
            </p>
          </div>
        </Card>
        <Card className="flex items-center justify-between p-4">
          <div>
            <p className="text-xs text-brand-500 font-medium uppercase">{t('admin.staff.monthly_payroll')}</p>
            <p className="text-2xl font-bold text-brand-900 mt-1">
              {formatCurrency(totalPayroll)}
            </p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="w-full">
            <p className="text-xs text-brand-500 font-medium uppercase mb-2">{t('admin.staff.filter_status')}</p>
            <div className="flex bg-brand-50 rounded-lg p-1 border border-brand-200">
              {['all', 'active', 'inactive'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterActive(status)}
                  className={cn(
                    'flex-1 text-center py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer',
                    filterActive === status
                      ? 'bg-white shadow text-brand-800'
                      : 'text-brand-400 hover:text-brand-600'
                  )}
                >
                  {t('admin.staff.' + status)}
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {error && (
        <div className="p-4 bg-danger-50 text-danger-700 rounded-lg text-sm">
          {t('admin.staff.error')} {error}
        </div>
      )}

      {/* Employee List */}
      <Card padding={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-start text-sm">
            <thead className="bg-brand-900 text-white text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">{t('admin.staff.table.name')}</th>
                <th className="px-6 py-4">{t('admin.staff.table.phone')}</th>
                <th className="px-6 py-4">{t('admin.staff.table.role')}</th>
                <th className="px-6 py-4">{t('admin.staff.table.shift')}</th>
                <th className="px-6 py-4">{t('admin.staff.table.salary')}</th>
                <th className="px-6 py-4">{t('admin.staff.table.status')}</th>
                <th className="px-6 py-4 text-end">{t('admin.staff.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 bg-white">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-brand-50/20 transition-colors">
                  <td className="px-6 py-4 font-semibold text-brand-900">
                    {emp.name}
                  </td>
                  <td className="px-6 py-4 text-brand-700 font-mono">
                    {emp.phone}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={getRoleVariant(emp.role)}>
                      {emp.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-brand-600 capitalize">
                    {emp.shift || 'morning'}
                  </td>
                  <td className="px-6 py-4 font-bold text-brand-950">
                    {formatCurrency(emp.salary ?? 0)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(emp.id, emp.is_active)}
                      className="cursor-pointer flex items-center gap-1.5"
                    >
                      {emp.is_active ? (
                        <span className="text-success-700 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" /> {t('admin.staff.active_status')}
                        </span>
                      ) : (
                        <span className="text-danger-700 flex items-center gap-1">
                          <XCircle className="h-4 w-4" /> {t('admin.staff.inactive_status')}
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-end">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 py-1 text-brand-600"
                        onClick={() => handleOpenEdit(emp)}
                      >
                        <Edit2 className="h-4 w-4" /> {t('admin.staff.edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-2 py-1 text-danger-600 hover:text-danger-700"
                        onClick={() => handleDelete(emp)}
                      >
                        <Trash2 className="h-4 w-4" /> {t('admin.staff.delete')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-brand-400">
                    {t('admin.staff.no_employees')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEmployee ? t('admin.staff.modal.edit_title') : t('admin.staff.modal.add_title')}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('admin.staff.modal.full_name')}
              placeholder={t('admin.staff.modal.name_placeholder')}
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              label={t('admin.staff.modal.phone')}
              placeholder={t('admin.staff.modal.phone_placeholder')}
              required
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Select
              label={t('admin.staff.modal.role')}
              value={formData.role}
              onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
              options={roles.map((r) => ({ value: r, label: r.toUpperCase() }))}
            />
            <Select
              label={t('admin.staff.modal.preferred_shift')}
              value={formData.shift}
              onChange={(e) => setFormData((prev) => ({ ...prev, shift: e.target.value }))}
              options={shifts.map((s) => ({ value: s, label: s.toUpperCase() }))}
            />
            <Input
              label={t('admin.staff.modal.salary')}
              type="number"
              required
              placeholder={t('admin.staff.modal.salary_placeholder')}
              value={formData.salary}
              onChange={(e) => setFormData((prev) => ({ ...prev, salary: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-brand-100">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              {t('admin.staff.modal.cancel')}
            </Button>
            <Button variant="primary" type="submit">
              {t('admin.staff.modal.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
