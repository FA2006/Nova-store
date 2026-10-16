
import { useState } from 'react';
import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import Cart from './components/Cart';
import useCart from './hooks/useCart';
import storeConfig from './config/storeConfig';
import './App.css';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.has('reference') || searchParams.has('trxref');
  });
  const { addToCart } = useCart();

  return (
    <div className="app" id="home">
      <header className="site-header">
        <div className="announcement-bar">
          {storeConfig.announcement}
        </div>

        <Navbar onOpenCart={() => setIsCartOpen(true)} />
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <p className="eyebrow">THE EVERYDAY EDIT</p>

            <h1>
              Find your next
              <br />
              <span>favourite thing.</span>
            </h1>

            <p className="hero-description">
              Discover thoughtfully selected essentials that
              bring style, comfort, and simplicity to everyday life.
            </p>

            <a href="#products" className="hero-button">
              Explore collection <span aria-hidden="true">→</span>
            </a>

            <div className="hero-trust">
              <span>✓ Carefully selected products</span>
              <span>✓ Shopping made simple</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85"
                alt="A curated modern retail store"
              />
            </div>

            <div className="hero-floating-card">
              <span className="floating-card-icon">✦</span>
              <div>
                <strong>Made for everyday</strong>
                <p>Discover something special</p>
              </div>
            </div>
          </div>
        </section>

        <div className="store-benefits">
          <div>
            <span>01</span>
            <p>Thoughtful selection</p>
          </div>
          <div>
            <span>02</span>
            <p>Simple shopping</p>
          </div>
          <div>
            <span>03</span>
            <p>Everyday essentials</p>
          </div>
        </div>

        <ProductGrid onAddToCart={addToCart} />
      </main>

      <footer className="site-footer" id="footer">
        <a href="#home" className="footer-brand">
          {storeConfig.name}
        </a>
        <p>
          Thoughtfully selected essentials for everyday life.
        </p>
        <span>© {new Date().getFullYear()} {storeConfig.name}</span>
      </footer>

      {isCartOpen && (
        <Cart onClose={() => setIsCartOpen(false)} />
      )}
    </div>
  );
}

export default App;
