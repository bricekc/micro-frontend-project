import React, { useState } from "react";
import eventBus from "shared/eventBus";
import { products } from "shared/products";
import "./Product.css";

function Product() {
  const [addedIds, setAddedIds] = useState(new Set());

  const handleAddToCart = (product) => {
    eventBus.emit("cart:add", {
      id: product.id,
      name: product.name,
      price: product.price,
    });

    setAddedIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 500);
  };

  return (
    <div className="product-container">
      <h2 className="product-title">Catalogue Rétro Gaming</h2>
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-icon">{product.image}</div>
            <h3 className="product-name">{product.name}</h3>
            <p className="product-price">{product.price.toFixed(2)} €</p>
            <button
              className={`add-button ${addedIds.has(product.id) ? "added" : ""}`}
              onClick={() => handleAddToCart(product)}
            >
              {addedIds.has(product.id) ? "✓ Ajouté" : "Ajouter"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Product;
