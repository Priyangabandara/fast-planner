import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function App() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    order_number: '',
    product: '',
    quantity: '',
    due_date: ''
  });

  useEffect(() => {
    console.log('Using API_URL:', API_URL);
    fetch('/orders')
      .then(res => {
        if (!res.ok) throw new Error('Orders not found');
        return res.json();
      })
      .then(data => setOrders(data))
      .catch(err => setError(err.message));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      let errorMessage = 'Failed to add order';

      // ✅ Safe JSON error parsing
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // ✅ Fetch updated order list after successful POST
    const listRes = await fetch('/orders');
    if (!listRes.ok) throw new Error('Failed to fetch orders after adding');

    const ordersList = await listRes.json();
    setOrders(ordersList);
    setForm({ order_number: '', product: '', quantity: '', due_date: '' });
    setError(null); // Clear previous error
  } catch (err) {
    setError(err.message);
  }
};


  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!orders) return <div>Loading orders...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Orders</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          name="order_number"
          placeholder="Order Number"
          value={form.order_number}
          onChange={handleChange}
          required
        />
        <input
          name="product"
          placeholder="Product"
          value={form.product}
          onChange={handleChange}
          required
        />
        <input
          name="quantity"
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
          required
        />
        <input
          name="due_date"
          type="date"
          value={form.due_date}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Order</button>
      </form>

      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Order Number</th>
            <th style={thStyle}>Product</th>
            <th style={thStyle}>Quantity</th>
            <th style={thStyle}>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td style={tdStyle}>{order.id}</td>
              <td style={tdStyle}>{order.order_number}</td>
              <td style={tdStyle}>{order.product}</td>
              <td style={tdStyle}>{order.quantity}</td>
              <td style={tdStyle}>{order.due_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = {
  border: '1px solid #ccc',
  padding: '8px',
  backgroundColor: '#f4f4f4',
  textAlign: 'left',
};

const tdStyle = {
  border: '1px solid #ccc',
  padding: '8px',
};

export default App;
