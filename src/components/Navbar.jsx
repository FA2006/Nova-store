
import { useEffect, useState } from 'react';
import storeConfig from '../config/storeConfig';
import useCart from '../hooks/useCart';

export default function Navbar({ onOpenCart }) {
  const { cartCount } = useCart();
  const [activeLink, setActiveLink] = useState(
    () => window.location.hash || '#home',
  );

  useEffect(() => {
    const updateActiveLink = () => {
      setActiveLink(window.location.hash || '#home');
    };

    window.addEventListener('hashchange', updateActiveLink);
    return () => window.removeEventListener('hashchange', updateActiveLink);
  }, []);

  return (
    <header className="navbar">
      <a href="#home" className="navbar-logo">
        <span className="logo-mark">N</span>
        <span>{storeConfig.name}</span>
      </a>

      <nav className="navbar-links">
        <a href="#home" aria-current={activeLink === '#home' ? 'page' : undefined}>
          Home
        </a>
        <a href="#products" aria-current={activeLink === '#products' ? 'page' : undefined}>
          Shop
        </a>
        <a href="#footer" aria-current={activeLink === '#footer' ? 'page' : undefined}>
          About
        </a>
      </nav>

      <button
        type="button"
        className="cart-button"
        onClick={onOpenCart}
        aria-label={`Open shopping cart, ${cartCount} items`}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>

        <span>Cart</span>

        {cartCount > 0 && (
          <span className="cart-count">{cartCount}</span>
        )}
      </button>
    </header>
  );
}
