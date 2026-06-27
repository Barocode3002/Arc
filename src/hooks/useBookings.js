import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { generateBookingRef } from '../utils/helpers'

export function useBookings(cafeId) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchBookings = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .eq('cafe_id', cafeId)
        .order('created_at', { ascending: false })

      if (filters.status) query = query.eq('status', filters.status)
      if (filters.type) query = query.eq('type', filters.type)
      if (filters.date) query = query.eq('date', filters.date)

      const { data, error: err } = await query
      if (err) throw err
      setBookings(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [cafeId])

  const createBooking = async (bookingData) => {
    setError(null)
    const booking = {
      ...bookingData,
      cafe_id: cafeId,
      booking_ref: generateBookingRef(),
      status: 'pending',
    }

    const { data, error: err } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single()

    if (err) { setError(err.message); return null }
    return data
  }

  const updateStatus = async (id, status) => {
    setError(null)
    const { data, error: err } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (err) { setError(err.message); return null }
    setBookings((prev) => prev.map((b) => (b.id === id ? data : b)))
    return data
  }

  const addBookingFromRealtime = useCallback((booking) => {
    setBookings((prev) => {
      if (prev.some((b) => b.id === booking.id)) {
        return prev.map((b) => (b.id === booking.id ? booking : b))
      }
      return [booking, ...prev]
    })
  }, [])

  return { bookings, loading, error, fetchBookings, createBooking, updateStatus, addBookingFromRealtime }
}

export function useSpecialAddons(cafeId) {
  const [addons, setAddons] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchAddons = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('special_addons')
      .select('*')
      .eq('cafe_id', cafeId)
      .eq('is_available', true)

    setAddons(data || [])
    setLoading(false)
  }, [cafeId])

  return { addons, loading, fetchAddons }
}
