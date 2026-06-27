import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const EMPLOYEE_COLUMNS = 'id, cafe_id, name, role, phone, pin_code, salary, shift, is_active, created_at'

function isMissingEmployeeColumnError(message = '') {
  return message.includes("'salary'") || message.includes("'shift'")
}

function buildEmployeePayload(employee, cafeId, { includeExtended = true } = {}) {
  const payload = {
    name: employee.name,
    phone: employee.phone,
    role: employee.role,
    cafe_id: cafeId,
    is_active: employee.is_active ?? true,
  }

  if (includeExtended) {
    if (employee.salary != null && employee.salary !== '') {
      payload.salary = employee.salary
    }
    if (employee.shift) {
      payload.shift = employee.shift
    }
  }

  return payload
}

export function useStaff(cafeId) {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchEmployees = useCallback(async (activeOnly = false) => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('employees')
        .select(EMPLOYEE_COLUMNS)
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false })

      if (activeOnly) query = query.eq('is_active', true)

      let { data, error: err } = await query

      if (err && isMissingEmployeeColumnError(err.message)) {
        let fallbackQuery = supabase
          .from('employees')
          .select('id, cafe_id, name, role, phone, pin_code, is_active, created_at')
          .eq('cafe_id', cafeId)
          .order('created_at', { ascending: false })
        if (activeOnly) fallbackQuery = fallbackQuery.eq('is_active', true)
        ;({ data, error: err } = await fallbackQuery)
      }
      if (err) throw err
      setEmployees(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [cafeId])

  const addEmployee = async (employee) => {
    setError(null)
    let { data, error: err } = await supabase
      .from('employees')
      .insert(buildEmployeePayload(employee, cafeId))
      .select(EMPLOYEE_COLUMNS)
      .single()

    if (err && isMissingEmployeeColumnError(err.message)) {
      ;({ data, error: err } = await supabase
        .from('employees')
        .insert(buildEmployeePayload(employee, cafeId, { includeExtended: false }))
        .select('id, cafe_id, name, role, phone, pin_code, is_active, created_at')
        .single())
    }

    if (err) { setError(err.message); return null }
    setEmployees((prev) => [data, ...prev])
    return data
  }

  const updateEmployee = async (id, updates) => {
    setError(null)
    let payload = { ...updates }
    let { data, error: err } = await supabase
      .from('employees')
      .update(payload)
      .eq('id', id)
      .select(EMPLOYEE_COLUMNS)
      .single()

    if (err && isMissingEmployeeColumnError(err.message)) {
      const { salary, shift, ...baseUpdates } = payload
      ;({ data, error: err } = await supabase
        .from('employees')
        .update(baseUpdates)
        .eq('id', id)
        .select('id, cafe_id, name, role, phone, pin_code, is_active, created_at')
        .single())
    }

    if (err) { setError(err.message); return null }
    setEmployees((prev) => prev.map((e) => (e.id === id ? data : e)))
    return data
  }

  const toggleActive = async (id, currentState) => {
    return updateEmployee(id, { is_active: !currentState })
  }

  const deleteEmployee = async (id) => {
    setError(null)
    const { error: err } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (err) { setError(err.message); return false }
    setEmployees((prev) => prev.filter((e) => e.id !== id))
    return true
  }

  return { employees, loading, error, fetchEmployees, addEmployee, updateEmployee, toggleActive, deleteEmployee }
}

export function useShifts(cafeId) {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchShifts = useCallback(async (date) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('shifts')
        .select('*')
        .eq('cafe_id', cafeId)
        .eq('date', date)

      if (err) throw err
      setShifts(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [cafeId])

  const upsertShift = async (employeeId, date, shiftType, status, note = '') => {
    setError(null)
    // Check if shift exists for this employee on this date
    const existing = shifts.find(
      (s) => s.employee_id === employeeId && s.shift_type === shiftType
    )

    if (existing) {
      const { data, error: err } = await supabase
        .from('shifts')
        .update({ status, note })
        .eq('id', existing.id)
        .select('*')
        .single()

      if (err) { setError(err.message); return null }
      setShifts((prev) => prev.map((s) => (s.id === existing.id ? data : s)))
      return data
    } else {
      const { data, error: err } = await supabase
        .from('shifts')
        .insert({ employee_id: employeeId, cafe_id: cafeId, date, shift_type: shiftType, status, note })
        .select('*')
        .single()

      if (err) { setError(err.message); return null }
      setShifts((prev) => [...prev, data])
      return data
    }
  }

  return { shifts, loading, error, fetchShifts, upsertShift }
}
