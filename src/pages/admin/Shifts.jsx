import { useState, useEffect } from 'react'
import { Calendar, Save, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useShifts, useStaff } from '../../hooks/useStaff'
import { DEFAULT_CAFE_ID, getTodayDate, statusVariant } from '../../utils/helpers'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'

export default function Shifts() {
  const { t } = useTranslation()
  const [selectedDate, setSelectedDate] = useState(getTodayDate())
  const { employees, fetchEmployees } = useStaff(DEFAULT_CAFE_ID)
  const { shifts, loading, error, fetchShifts, upsertShift } = useShifts(DEFAULT_CAFE_ID)

  // Track edits locally so it's snappy
  const [notes, setNotes] = useState({})

  useEffect(() => {
    fetchEmployees(true) // Get active employees only
  }, [fetchEmployees])

  useEffect(() => {
    fetchShifts(selectedDate)
  }, [fetchShifts, selectedDate])

  const handleStatusChange = async (employeeId, shiftType, status) => {
    const note = notes[`${employeeId}_${shiftType}`] || ''
    await upsertShift(employeeId, selectedDate, shiftType, status, note)
  }

  const handleNoteChange = (employeeId, shiftType, noteValue) => {
    setNotes((prev) => ({
      ...prev,
      [`${employeeId}_${shiftType}`]: noteValue,
    }))
  }

  const handleSaveNote = async (employeeId, shiftType) => {
    const status = getEmployeeShiftStatus(employeeId, shiftType)
    if (!status || status === 'unmarked') {
      alert(t('admin.shifts.alert_status'))
      return
    }
    const note = notes[`${employeeId}_${shiftType}`] || ''
    await upsertShift(employeeId, selectedDate, shiftType, status, note)
  }

  const getEmployeeShiftStatus = (employeeId, shiftType) => {
    const record = shifts.find(
      (s) => s.employee_id === employeeId && s.shift_type === shiftType
    )
    return record ? record.status : 'unmarked'
  }

  const getEmployeeShiftNote = (employeeId, shiftType) => {
    const record = shifts.find(
      (s) => s.employee_id === employeeId && s.shift_type === shiftType
    )
    return record ? record.note : ''
  }

  // Pre-fill notes when shifts load
  useEffect(() => {
    const initialNotes = {}
    shifts.forEach((s) => {
      initialNotes[`${s.employee_id}_${s.shift_type}`] = s.note || ''
    })
    setNotes(initialNotes)
  }, [shifts])

  // Count summaries
  const summary = shifts.reduce(
    (acc, s) => {
      if (s.status === 'present') acc.present++
      if (s.status === 'absent') acc.absent++
      if (s.status === 'late') acc.late++
      return acc
    },
    { present: 0, absent: 0, late: 0 }
  )

  // Helper to determine if shift is applicable
  const isShiftApplicable = (employeeShiftPref, shiftType) => {
    if (employeeShiftPref === 'both') return true
    return employeeShiftPref === shiftType
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-brand-900">{t('admin.shifts.title')}</h1>
          <p className="text-sm text-brand-500 mt-1">{t('admin.shifts.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchShifts(selectedDate)}
            loading={loading}
          >
            <RefreshCw className="h-4 w-4" /> {t('admin.shifts.refresh')}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-4 border-s-4 border-success-500">
          <p className="text-xs text-brand-500 font-medium uppercase">{t('admin.shifts.present')}</p>
          <p className="text-2xl font-bold text-success-700 mt-1">{summary.present}</p>
        </Card>
        <Card className="p-4 border-s-4 border-danger-500">
          <p className="text-xs text-brand-500 font-medium uppercase">{t('admin.shifts.absent')}</p>
          <p className="text-2xl font-bold text-danger-700 mt-1">{summary.absent}</p>
        </Card>
        <Card className="p-4 border-s-4 border-warning-500">
          <p className="text-xs text-brand-500 font-medium uppercase">{t('admin.shifts.late')}</p>
          <p className="text-2xl font-bold text-warning-700 mt-1">{summary.late}</p>
        </Card>
      </div>

      {error && (
        <div className="p-4 bg-danger-50 text-danger-700 rounded-lg text-sm">
          {t('admin.shifts.error')} {error}
        </div>
      )}

      {/* Attendance sheet */}
      <Card padding={false} className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-start text-sm">
            <thead className="bg-brand-900 text-white text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">{t('admin.shifts.table.employee')}</th>
                <th className="px-6 py-4">{t('admin.shifts.table.role')}</th>
                <th className="px-6 py-4">{t('admin.shifts.table.shift_preference')}</th>
                <th className="px-6 py-4">{t('admin.shifts.table.morning')}</th>
                <th className="px-6 py-4">{t('admin.shifts.table.evening')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-100 bg-white">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-brand-50/10 transition-colors">
                  <td className="px-6 py-4 font-semibold text-brand-900">
                    {emp.name}
                  </td>
                  <td className="px-6 py-4 text-brand-600 capitalize">
                    {emp.role}
                  </td>
                  <td className="px-6 py-4 text-brand-500 capitalize">
                    {emp.shift}
                  </td>
                  {/* Morning Shift Column */}
                  <td className="px-6 py-4">
                    {isShiftApplicable(emp.shift, 'morning') ? (
                      <div className="space-y-2">
                        <Select
                          value={getEmployeeShiftStatus(emp.id, 'morning')}
                          onChange={(e) => handleStatusChange(emp.id, 'morning', e.target.value)}
                          options={[
                            { value: 'unmarked', label: t('admin.shifts.unmarked') },
                            { value: 'present', label: t('admin.shifts.present') },
                            { value: 'absent', label: t('admin.shifts.absent') },
                            { value: 'late', label: t('admin.shifts.late') },
                          ]}
                          className="py-1 text-xs"
                        />
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder={t('admin.shifts.add_note')}
                            className="w-full text-xs rounded border border-brand-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-brand-50/50"
                            value={notes[`${emp.id}_morning`] || ''}
                            onChange={(e) => handleNoteChange(emp.id, 'morning', e.target.value)}
                          />
                          <button
                            onClick={() => handleSaveNote(emp.id, 'morning')}
                            className="p-1 rounded bg-brand-100 text-brand-700 hover:bg-brand-200 transition-colors cursor-pointer"
                          >
                            <Save className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-brand-300 italic">{t('admin.shifts.not_scheduled')}</span>
                    )}
                  </td>
                  {/* Evening Shift Column */}
                  <td className="px-6 py-4">
                    {isShiftApplicable(emp.shift, 'evening') ? (
                      <div className="space-y-2">
                        <Select
                          value={getEmployeeShiftStatus(emp.id, 'evening')}
                          onChange={(e) => handleStatusChange(emp.id, 'evening', e.target.value)}
                          options={[
                            { value: 'unmarked', label: t('admin.shifts.unmarked') },
                            { value: 'present', label: t('admin.shifts.present') },
                            { value: 'absent', label: t('admin.shifts.absent') },
                            { value: 'late', label: t('admin.shifts.late') },
                          ]}
                          className="py-1 text-xs"
                        />
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder={t('admin.shifts.add_note')}
                            className="w-full text-xs rounded border border-brand-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500 bg-brand-50/50"
                            value={notes[`${emp.id}_evening`] || ''}
                            onChange={(e) => handleNoteChange(emp.id, 'evening', e.target.value)}
                          />
                          <button
                            onClick={() => handleSaveNote(emp.id, 'evening')}
                            className="p-1 rounded bg-brand-100 text-brand-700 hover:bg-brand-200 transition-colors cursor-pointer"
                          >
                            <Save className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-brand-300 italic">{t('admin.shifts.not_scheduled')}</span>
                    )}
                  </td>
                </tr>
              ))}

              {!loading && employees.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-brand-400">
                    {t('admin.shifts.no_employees')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
