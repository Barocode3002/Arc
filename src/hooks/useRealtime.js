import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Subscribe to realtime changes on a Supabase table.
 * Calls onInsert for new rows, onUpdate for changed rows.
 */
export function useRealtime(table, cafeId, { onInsert, onUpdate } = {}) {
  const channelRef = useRef(null)

  useEffect(() => {
    if (!cafeId) return

    const channel = supabase
      .channel(`${table}_${cafeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
          filter: `cafe_id=eq.${cafeId}`,
        },
        (payload) => {
          onInsert?.(payload.new)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table,
          filter: `cafe_id=eq.${cafeId}`,
        },
        (payload) => {
          onUpdate?.(payload.new)
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, cafeId, onInsert, onUpdate])

  return channelRef
}
