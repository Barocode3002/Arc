import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useInventory(cafeId) {
  const [items, setItems] = useState([])
  const [transactions, setTransactions] = useState([])
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('name', { ascending: true })

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
      .from('inventory_items')
      .insert({ ...item, cafe_id: cafeId })
      .select()
      .single()

    if (err) { setError(err.message); return null }
    setItems((prev) => [...prev, data])
    return data
  }

  const fetchTransactions = useCallback(async () => {
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('inventory_transactions')
        .select('*, inventory_items(name), employees(name)')
        .eq('cafe_id', cafeId)
        .order('date', { ascending: false })
        .limit(100)

      if (err) throw err
      setTransactions(data || [])
    } catch (err) {
      setError(err.message)
    }
  }, [cafeId])

  const addTransaction = async (transaction) => {
    setError(null)
    const { data, error: err } = await supabase
      .from('inventory_transactions')
      .insert({ ...transaction, cafe_id: cafeId })
      .select('*, inventory_items(name), employees(name)')
      .single()

    if (err) { setError(err.message); return null }

    // Update the stock level locally
    const item = items.find((i) => i.id === transaction.item_id)
    if (item) {
      const newStock = transaction.type === 'in'
        ? item.current_stock + transaction.quantity
        : item.current_stock - transaction.quantity

      await supabase
        .from('inventory_items')
        .update({ current_stock: newStock })
        .eq('id', transaction.item_id)

      setItems((prev) =>
        prev.map((i) => (i.id === transaction.item_id ? { ...i, current_stock: newStock } : i))
      )
    }

    setTransactions((prev) => [data, ...prev])
    return data
  }

  const fetchPurchases = useCallback(async () => {
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('purchases')
        .select('*, inventory_items(name)')
        .eq('cafe_id', cafeId)
        .order('date', { ascending: false })
        .limit(100)

      if (err) throw err
      setPurchases(data || [])
    } catch (err) {
      setError(err.message)
    }
  }, [cafeId])

  const addPurchase = async (purchase) => {
    setError(null)
    const totalCost = purchase.quantity * purchase.unit_cost
    const { data, error: err } = await supabase
      .from('purchases')
      .insert({ ...purchase, cafe_id: cafeId, total_cost: totalCost })
      .select('*, inventory_items(name)')
      .single()

    if (err) { setError(err.message); return null }

    // Also add as inventory transaction (stock in)
    await addTransaction({
      item_id: purchase.item_id,
      type: 'in',
      quantity: purchase.quantity,
      note: `Purchase from ${purchase.supplier_name}`,
      date: purchase.date,
    })

    setPurchases((prev) => [data, ...prev])
    return data
  }

  return {
    items, transactions, purchases,
    loading, error,
    fetchItems, addItem,
    fetchTransactions, addTransaction,
    fetchPurchases, addPurchase,
  }
}
