import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lpnbocarbxmtjrenweyi.supabase.co'
const supabaseKey = 'sb_publishable_kpeznsvKB54W9Ri0iH5FMA_9R2qldUF'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testInsert() {
  console.log('Testing connection...')
  
  // 1. Check cafes
  const { data: cafes, error: cafeErr } = await supabase.from('cafes').select('*')
  console.log('Cafes:', cafes, 'Error:', cafeErr?.message)

  // 2. Try inserting menu item
  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      cafe_id: 1,
      name: 'Test Item',
      price: 10,
      category: 'Test',
      sort_order: 1
    })
    .select()
    
  console.log('Insert Data:', data)
  console.log('Insert Error:', error)
}

testInsert()
