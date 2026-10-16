
import storeConfig from '../config/storeConfig';

export default function ProductCard({ product, onAddToCart }) {
  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: storeConfig.currency,
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <article className="product-card">
      <div className="product-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />

        {product.featured && (
          <span className="product-badge">Featured</span>
        )}
      </div>

      <div className="product-info">
        <p className="product-category">{product.category}</p>

        <h3 className="product-name">{product.name}</h3>

        <p className="product-rating">
          <span aria-hidden="true">★</span> {product.rating}
        </p>

        <p className="product-description">
          {product.description}
        </p>

        <div className="product-card-bottom">
          <span className="product-price">{formattedPrice}</span>

          <button
            type="button"
            className="add-to-cart-button"
            onClick={() => onAddToCart(product)}
          >
            Add to cart <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>
    </article>
  );
}
