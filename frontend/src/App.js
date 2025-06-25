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
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const listRes = await fetch('/orders');
      if (!listRes.ok) throw new Error('Failed to fetch orders after adding');

      const ordersList = await listRes.json();
      setOrders(ordersList);
      setForm({ order_number: '', product: '', quantity: '', due_date: '' });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;
  if (!orders) return <div style={{ padding: '20px' }}>Loading orders...</div>;

  // Sort orders by due_date ascending for tiles display
  const sortedOrdersByDueDate = [...orders].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  return (
    <div style={styles.page}>
      <div style={styles.mainContainer}>
        <div style={styles.container}>
          <h1 style={styles.title}>Fast React</h1>

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              name="order_number"
              placeholder="Order Number"
              value={form.order_number}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <input
              name="product"
              placeholder="Product"
              value={form.product}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <input
              name="quantity"
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <input
              name="due_date"
              type="date"
              value={form.due_date}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.button}>➕ Add Order</button>
          </form>

          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Order #</th>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Qty</th>
                <th style={styles.th}>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} style={styles.tr}>
                  <td style={styles.td}>{order.id}</td>
                  <td style={styles.td}>{order.order_number}</td>
                  <td style={styles.td}>{order.product}</td>
                  <td style={styles.td}>{order.quantity}</td>
                  <td style={styles.td}>{order.due_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right side tile panel */}
        <div style={styles.tilePanel}>
          <h2 style={styles.tileTitle}>Orders by Due Date</h2>
          <div style={styles.tileContainer}>
            {sortedOrdersByDueDate.map(order => (
              <div key={order.id} style={styles.tile}>
                <div style={styles.tileOrderNumber}>{order.order_number}</div>
                <div style={styles.tileDueDate}>{order.due_date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: 'linear-gradient(to right, #fbc2eb, #a6c1ee)',
    minHeight: '100vh',
    padding: '40px 60px',
    fontFamily: 'Segoe UI, sans-serif',
  },
  mainContainer: {
    display: 'flex',
    gap: '30px',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  container: {
    width: '50%',
    backgroundColor: '#ffffffee',
    borderRadius: '16px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    padding: '30px',
  },
  title: {
    textAlign: 'left',
    marginBottom: '24px',
    color: '#5b3cc4',
    fontSize: '26px',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'space-between',
    marginBottom: '30px',
  },
  input: {
    flex: '1 1 45%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px',
    backgroundColor: '#fffef6',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
  },
  button: {
    width: '100%',
    background: 'linear-gradient(to right, #ff758c, #ff7eb3)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
    transition: '0.3s',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13.5px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  th: {
    backgroundColor: '#5b3cc4',
    color: 'white',
    padding: '10px',
    textAlign: 'left',
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #f3f3f3',
    backgroundColor: '#ffffff',
    color: '#333',
  },
  tr: {
    transition: 'background 0.2s',
  },

  // Right side tiles styles
  tilePanel: {
    width: '30%',
    backgroundColor: '#ffffffee',
    borderRadius: '16px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
    padding: '20px',
    maxHeight: '80vh',
    overflowY: 'auto',
  },
  tileTitle: {
    fontSize: '22px',
    fontWeight: '600',
    color: '#5b3cc4',
    marginBottom: '16px',
  },
  tileContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  tile: {
    background: '#5b3cc4',
    color: 'white',
    padding: '14px 18px',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    fontWeight: '600',
    fontSize: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tileOrderNumber: {
    flex: 1,
  },
  tileDueDate: {
    marginLeft: '10px',
    fontSize: '14px',
    opacity: 0.8,
  },
};

export default App;
