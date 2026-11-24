
import React, { useEffect, useMemo, useState } from 'react';
import {
  Search, ShoppingBag, Heart, User, Plus, Minus, Trash2, Menu
} from 'lucide-react';

const API = 'http://localhost:8081/api';

const fallback = [
  {
    id: 1, name: 'Hydrating Face Moisturizer',
    brand: 'Glow Recipe', category: 'Skincare',
    description: 'Daily lightweight hydration',
    price: 899,
    imageUrl: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=700'
  },
  {
    id: 2, name: 'Vitamin C Brightening Serum',
    brand: 'Minimalist', category: 'Skincare',
    description: 'Brightening serum for daily routine',
    price: 699,
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=700'
  },
  {
    id: 3, name: 'Gentle Foaming Cleanser',
    brand: 'Cetaphil', category: 'Skincare',
    description: 'Gentle everyday face cleanser',
    price: 549,
    imageUrl: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=700'
  },
  {
    id: 4, name: 'Matte Lipstick',
    brand: 'Maybelline', category: 'Makeup',
    description: 'Comfortable matte colour',
    price: 499,
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=700'
  },
  {
    id: 5, name: 'Everyday Foundation',
    brand: "L'Oreal Paris", category: 'Makeup',
    description: 'Natural-looking foundation',
    price: 799,
    imageUrl: 'https://images.unsplash.com/photo-1631214540242-6cb7b3c6b6b4?w=700'
  },
  {
    id: 6, name: 'Daily Sunscreen SPF 50',
    brand: 'Aqualogica', category: 'Skincare',
    description: 'Lightweight daily sun protection',
    price: 599,
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=700'
  }
];

const money = n => '₹' + Number(n || 0).toLocaleString('en-IN');

export default function App() {
  const [products, setProducts] = useState(fallback);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  const [page, setPage] = useState('shop');
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  const [authMode, setAuthMode] = useState('login');
  const [form, setForm] = useState({
    name: '', email: '', password: ''
  });

  const [message, setMessage] = useState('');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState('Cash on Delivery');
  const [orders, setOrders] = useState([]);

  const [adminProduct, setAdminProduct] = useState({
    name: '', brand: '', category: 'Skincare',
    description: '', price: '', imageUrl: ''
  });

  // Load products
  useEffect(() => {
    fetch(API + '/products')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (data.length) setProducts(data);
      })
      .catch(() => console.log('Using sample products'));
  }, []);

  // Filter products
  const visible = useMemo(() => {
    return products.filter(p =>
      (category === 'All' || p.category === category) &&
      `${p.name} ${p.brand}`.toLowerCase().includes(query.toLowerCase())
    );
  }, [products, category, query]);

  const count = cart.reduce((s, p) => s + p.qty, 0);
  const total = cart.reduce((s, p) => s + p.price * p.qty, 0);

  const updateForm = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  // Navigation
  function openCategory(value) {
    setCategory(value);
    setPage('shop');
    setMessage('');
  }

  async function openOrders() {
    if (!user) {
      setPage('account');
      setMessage('Please log in to view your orders.');
      return;
    }

    setPage('orders');
    await loadOrders();
  }

  // Add to cart
  function add(product) {
    setCart(cartItems => {
      const old = cartItems.find(p => p.id === product.id);

      return old
        ? cartItems.map(p =>
            p.id === product.id
              ? { ...p, qty: p.qty + 1 }
              : p
          )
        : [...cartItems, { ...product, qty: 1 }];
    });

    setMessage('Added to your bag');
  }

  function changeQty(id, delta) {
    setCart(items =>
      items
        .map(p => p.id === id ? { ...p, qty: p.qty + delta } : p)
        .filter(p => p.qty > 0)
    );
  }

  // Login and registration
  async function auth(e) {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(
        API + `/auth/${authMode}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to continue');
      }

      setUser(data);
      setPage('shop');
      setMessage(`Welcome, ${data.name}!`);

    } catch (error) {
      setMessage(error.message + ' — check backend connection.');
    }
  }

  // Load orders
  async function loadOrders() {
    if (!user) return;

    try {
      const response = await fetch(
        API + '/orders/' + encodeURIComponent(user.email)
      );

      if (!response.ok) throw new Error('Could not load orders');

      setOrders(await response.json());

    } catch (error) {
      setOrders([]);
      setMessage(error.message);
    }
  }

  // Checkout
  async function checkout(e) {
    e.preventDefault();

    if (!user) {
      setPage('account');
      setMessage('Please log in before placing an order.');
      return;
    }

    try {
      const response = await fetch(API + '/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: user.email,
          items: JSON.stringify(
            cart.map(({ id, name, qty, price }) => ({
              id, name, qty, price
            }))
          ),
          address,
          paymentMethod: payment,
          total
        })
      });

      if (!response.ok) throw new Error('Order could not be saved');

      setCart([]);
      setMessage('Your order has been placed!');
      setPage('orders');
      loadOrders();

    } catch (error) {
      setMessage(error.message + ' — check backend connection.');
    }
  }

  // Admin product
  async function addProduct(e) {
    e.preventDefault();

    try {
      const response = await fetch(API + '/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...adminProduct,
          price: Number(adminProduct.price)
        })
      });

      if (!response.ok) throw new Error();

      const product = await response.json();

      setProducts(items => [...items, product]);

      setAdminProduct({
        name: '', brand: '', category: 'Skincare',
        description: '', price: '', imageUrl: ''
      });

      setMessage('Product added successfully');

    } catch {
      setMessage('Could not add product. Check backend connection.');
    }
  }

  function logout() {
    setUser(null);
    setOrders([]);
    setPage('shop');
    setMessage('You have logged out.');
  }

  return (
    <div className="app">

      <div className="topline">
        ✨ A little glow goes a long way — discover your beauty essentials
      </div>

      <header>
        <button className="iconbtn mobile" onClick={() => openCategory('All')}>
          <Menu />
        </button>

        <div className="logo" onClick={() => openCategory('All')}>
          <span>✦</span> GlowGenie
        </div>

        <nav>
          <button onClick={() => openCategory('All')}>Home</button>
          <button onClick={() => openCategory('Skincare')}>Skincare</button>
          <button onClick={() => openCategory('Makeup')}>Makeup</button>
          <button onClick={openOrders}>My Orders</button>
        </nav>

        <div className="head-actions">
          <button className="iconbtn" onClick={() => setPage('account')}>
            <User />
          </button>

          <button className="iconbtn bag" onClick={() => setPage('cart')}>
            <ShoppingBag />
            <i>{count}</i>
          </button>
        </div>
      </header>

      {message && (
        <div className="notice" onClick={() => setMessage('')}>
          {message} <span>×</span>
        </div>
      )}

      {/* HOME AND PRODUCT CATALOGUE */}
      {page === 'shop' && (
        <>
          <section className="hero">
            <div>
              <p className="eyebrow">YOUR BEAUTY, YOUR WAY</p>

              <h1>
                Find your glow.<br />
                <em>Feel the magic.</em>
              </h1>

              <p>
                Thoughtful skincare and feel-good makeup from brands you love.
              </p>

              <button
                className="primary"
                onClick={() =>
                  document.getElementById('catalogue')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                Shop the collection
              </button>
            </div>

            <div className="hero-art">
              <div className="sun"></div>
              <div className="hero-label">
                GLOW<br />FROM<br />WITHIN ✦
              </div>
            </div>
          </section>

          <main id="catalogue">
            <div className="section-head">
              <div>
                <p className="eyebrow">THE GLOW EDIT</p>
                <h2>Beauty favourites</h2>
              </div>

              <div className="search">
                <Search size={18} />
                <input
                  placeholder="Search products or brands..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="filters">
              {['All', 'Skincare', 'Makeup'].map(c => (
                <button
                  key={c}
                  className={category === c ? 'active' : ''}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="products">
              {visible.map(p => (
                <article className="product" key={p.id}>
                  <div className="product-image">
                    <img src={p.imageUrl} alt={p.name} />
                    <button className="heart">
                      <Heart size={18} />
                    </button>
                  </div>

                  <div className="product-info">
                    <small>{p.brand}</small>
                    <h3>{p.name}</h3>
                    <p>{p.description}</p>

                    <div className="buyline">
                      <b>{money(p.price)}</b>
                      <button onClick={() => add(p)}>
                        Add to bag +
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {visible.length === 0 && (
              <p className="empty">No products found. Try another search.</p>
            )}
          </main>
        </>
      )}

      {/* ACCOUNT */}
      {page === 'account' && (
        <main className="narrow">
          <p className="eyebrow">WELCOME TO GLOWGENIE</p>

          <h2>
            {authMode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>

          <p>Sign in to save your bag and track your orders.</p>

          <form className="panel form" onSubmit={auth}>
            {authMode === 'register' && (
              <label>
                Full name
                <input
                  required
                  value={form.name}
                  onChange={e => updateForm('name', e.target.value)}
                />
              </label>
            )}

            <label>
              Email address
              <input
                required
                type="email"
                value={form.email}
                onChange={e => updateForm('email', e.target.value)}
              />
            </label>

            <label>
              Password
              <input
                required
                type="password"
                minLength="4"
                value={form.password}
                onChange={e => updateForm('password', e.target.value)}
              />
            </label>

            <button className="primary">
              {authMode === 'login' ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p className="switch">
            {authMode === 'login'
              ? 'New to GlowGenie?'
              : 'Already have an account?'}

            <button
              onClick={() =>
                setAuthMode(authMode === 'login' ? 'register' : 'login')
              }
            >
              {authMode === 'login' ? 'Create account' : 'Log in'}
            </button>
          </p>

          {user && (
            <button className="outline" onClick={logout}>
              Log out
            </button>
          )}
        </main>
      )}

      {/* CART */}
      {page === 'cart' && (
        <main>
          <p className="eyebrow">YOUR SELECTION</p>
          <h2>Your shopping bag</h2>

          {!cart.length ? (
            <div className="empty">
              Your bag is waiting for a little magic.
              <button className="primary" onClick={() => setPage('shop')}>
                Continue shopping
              </button>
            </div>
          ) : (
            <div className="checkout-grid">
              <div className="panel">
                {cart.map(p => (
                  <div className="cart-row" key={p.id}>
                    <img src={p.imageUrl} alt={p.name} />

                    <div className="grow">
                      <b>{p.name}</b>
                      <small>{p.brand}</small>
                      <strong>{money(p.price)}</strong>
                    </div>

                    <div className="qty">
                      <button onClick={() => changeQty(p.id, -1)}>
                        <Minus size={15} />
                      </button>

                      {p.qty}

                      <button onClick={() => changeQty(p.id, 1)}>
                        <Plus size={15} />
                      </button>
                    </div>

                    <button
                      className="iconbtn"
                      onClick={() =>
                        setCart(items => items.filter(x => x.id !== p.id))
                      }
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>

              <aside className="panel summary">
                <h3>Order summary</h3>
                <p>Subtotal <b>{money(total)}</b></p>
                <p>Delivery <b>Free</b></p>
                <hr />
                <h3>Total <b>{money(total)}</b></h3>

                <button
                  className="primary full"
                  onClick={() => setPage('checkout')}
                >
                  Proceed to checkout
                </button>
              </aside>
            </div>
          )}
        </main>
      )}

      {/* CHECKOUT */}
      {page === 'checkout' && (
        <main className="narrow">
          <p className="eyebrow">ALMOST YOURS</p>
          <h2>Checkout</h2>

          <form className="panel form" onSubmit={checkout}>
            <label>
              Delivery address
              <textarea
                required
                rows="3"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="House/flat, street, area, city, PIN code"
              />
            </label>

            <label>
              Payment method
              <select
                value={payment}
                onChange={e => setPayment(e.target.value)}
              >
                <option>Cash on Delivery</option>
                <option>UPI (payment integration required)</option>
              </select>
            </label>

            <h3>Order total: {money(total)}</h3>
            <button className="primary">Place order</button>
          </form>
        </main>
      )}

      {/* MY ORDERS */}
      {page === 'orders' && (
        <main>
          <div className="section-head">
            <div>
              <p className="eyebrow">YOUR GLOWGENIE ACCOUNT</p>
              <h2>My orders</h2>
            </div>

            <button className="outline" onClick={loadOrders}>
              Refresh orders
            </button>
          </div>

          {!user ? (
            <div className="empty">
              Please log in to view your orders.
              <button
                className="primary"
                onClick={() => setPage('account')}
              >
                Log in
              </button>
            </div>
          ) : (
            <div className="panel">
              {orders.length ? (
                orders.map(o => (
                  <div className="order-row" key={o.id}>
                    <div>
                      <b>Order #{o.id}</b>
                      <p>{o.status} · {o.paymentMethod}</p>
                      <small>{o.address}</small>
                    </div>

                    <strong>{money(o.total)}</strong>
                  </div>
                ))
              ) : (
                <p>No orders yet. Your next beauty find is waiting!</p>
              )}
            </div>
          )}
        </main>
      )}

      {/* ADMIN */}
      {page === 'admin' && (
        <main className="narrow">
          <p className="eyebrow">STORE MANAGEMENT</p>
          <h2>Add a product</h2>

          <form className="panel form" onSubmit={addProduct}>
            {[
              ['name', 'Product name'],
              ['brand', 'Brand'],
              ['description', 'Description'],
              ['price', 'Price in ₹'],
              ['imageUrl', 'Image URL']
            ].map(([key, label]) => (
              <label key={key}>
                {label}
                <input
                  required
                  value={adminProduct[key]}
                  onChange={e =>
                    setAdminProduct(p => ({
                      ...p,
                      [key]: e.target.value
                    }))
                  }
                />
              </label>
            ))}

            <label>
              Category
              <select
                value={adminProduct.category}
                onChange={e =>
                  setAdminProduct(p => ({
                    ...p,
                    category: e.target.value
                  }))
                }
              >
                <option>Skincare</option>
                <option>Makeup</option>
              </select>
            </label>

            <button className="primary">Save product</button>
          </form>
        </main>
      )}

      <footer>
        <div className="logo">✦ GlowGenie</div>
        <p>Beauty that feels like you.</p>

        <div className="footlinks">
          <button onClick={() => openCategory('All')}>Shop</button>
          <button onClick={() => setPage('account')}>Account</button>
          <button onClick={() => setPage('admin')}>Admin</button>
        </div>

        <small>© 2026 GlowGenie. Made with a little sparkle.</small>
      </footer>

    </div>
  );
}
