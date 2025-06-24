require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// ✅ CORS fix for Codespaces: Allow all origins (for dev only)
app.use(cors());

app.use(express.json());
app.use((req, res, next) => {
  console.log(`📥 Received ${req.method} request on ${req.url}`);
  next();
});

// ✅ Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ✅ Fetch orders
async function fetchOrders(res) {
  const { data, error } = await supabase.from('orders').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

app.get('/', (req, res) => fetchOrders(res));
app.get('/orders', (req, res) => fetchOrders(res));

app.post('/orders', async (req, res) => {
  const { order_number, product, quantity, due_date } = req.body;

  const { data, error } = await supabase
    .from('orders')
    .insert([{ order_number, product, quantity, due_date }])
    .select(); // 👈 important to return inserted data!

  if (error) {
    console.error('Insert error:', error);
    return res.status(500).json({ error: error.message });
  }

  if (!data || data.length === 0) {
    return res.status(500).json({ error: 'No data returned after insert' });
  }

  res.status(201).json(data[0]); // ✅ returns a proper JSON response
});



// ✅ Important: Listen on 0.0.0.0 so Codespaces exposes port
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
