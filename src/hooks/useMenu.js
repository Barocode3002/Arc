import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useMenu(cafeId) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('menu_items')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('sort_order', { ascending: true })

      if (err) throw err
      setItems(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [cafeId])

  const addItem = async (item) => {
    setError(null)
    const { data, error: err } = await supabase
      .from('menu_items')
      .insert({ ...item, cafe_id: cafeId })
      .select()
      .single()

    if (err) { setError(err.message); return null }
    setItems((prev) => [...prev, data])
    return data
  }

  const updateItem = async (id, updates) => {
    setError(null)
    const { data, error: err } = await supabase
      .from('menu_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (err) { setError(err.message); return null }
    setItems((prev) => prev.map((i) => (i.id === id ? data : i)))
    return data
  }

  const deleteItem = async (id) => {
    setError(null)
    const { error: err } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)

    if (err) { setError(err.message); return false }
    setItems((prev) => prev.filter((i) => i.id !== id))
    return true
  }

  const toggleAvailability = async (id, currentState) => {
    return updateItem(id, { is_available: !currentState })
  }

  return { items, loading, error, fetchItems, addItem, updateItem, deleteItem, toggleAvailability }
}
