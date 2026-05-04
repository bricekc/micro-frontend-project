import React, { useEffect, useMemo, useState } from "react";
import eventBus from "shared/eventBus";
import "./Reco.css";

const defaultRecommendations = [
  { id: "rec-1", name: "Chargeur rapide", category: "accessory" },
  { id: "rec-2", name: "Coque de protection", category: "accessory" },
  { id: "rec-3", name: "Casque sans fil", category: "audio" },
  { id: "rec-4", name: "Carte mémoire 128GB", category: "storage" },
];

const complementaryRecommendations = {
  smartphone: [
    { id: "rec-1", name: "Chargeur rapide", category: "accessory" },
    { id: "rec-2", name: "Coque de protection", category: "accessory" },
  ],
  casque: [
    { id: "rec-3", name: "Adaptateur Bluetooth", category: "audio" },
    { id: "rec-4", name: "Câble de recharge USB-C", category: "accessory" },
  ],
  tablette: [
    { id: "rec-2", name: "Coque de protection", category: "accessory" },
    { id: "rec-4", name: "Stylet tactile", category: "accessory" },
  ],
};

function getRecommendations(cartItems) {
  if (!cartItems || cartItems.length === 0) {
    return defaultRecommendations;
  }

  const cartNames = new Set(
    cartItems.map((item) => item.name?.toLowerCase() || item.id?.toLowerCase()),
  );

  const recommendations = [];

  cartItems.forEach((item) => {
    const key = item.name?.toLowerCase();
    const matches = complementaryRecommendations[key];
    if (!matches) return;

    matches.forEach((recommendation) => {
      if (!cartNames.has(recommendation.name.toLowerCase())) {
        const alreadyAdded = recommendations.some(
          (rec) => rec.name === recommendation.name,
        );
        if (!alreadyAdded) {
          recommendations.push(recommendation);
        }
      }
    });
  });

  if (recommendations.length === 0) {
    return defaultRecommendations.filter(
      (recommendation) => !cartNames.has(recommendation.name.toLowerCase()),
    );
  }

  return recommendations;
}

function Reco() {
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({ count: 0, total: 0 });

  const recommendations = useMemo(
    () => getRecommendations(cartItems),
    [cartItems],
  );

  useEffect(() => {
    const handleCartUpdated = (data) => {
      if (!data) return;

      if (Array.isArray(data)) {
        setCartItems(data);
      } else if (data.items) {
        setCartItems(data.items);
      } else if (data.product) {
        setCartItems((prev) => [...prev, data.product]);
      }

      if (typeof data.count === "number" || typeof data.total === "number") {
        setCartSummary((prev) => ({
          count: typeof data.count === "number" ? data.count : prev.count,
          total: typeof data.total === "number" ? data.total : prev.total,
        }));
      }
    };

    const handleCartAdd = (product) => {
      if (!product) return;
      setCartItems((prev) => [...prev, product]);
      setCartSummary((prev) => ({
        count: prev.count + 1,
        total: prev.total + (product.price || 0),
      }));
    };

    const unsubscribeUpdated = eventBus.on("cart:updated", handleCartUpdated);
    const unsubscribeAdd = eventBus.on("cart:add", handleCartAdd);

    return () => {
      unsubscribeUpdated();
      unsubscribeAdd();
    };
  }, []);

  return (
    <div className="reco">
      <h2>Recommandations personnalisées</h2>
      <div className="reco-summary">
        <span>Articles dans le panier : {cartSummary.count}</span>
        <span>Total estimé : {cartSummary.total} €</span>
      </div>

      <div className="reco-list">
        {recommendations.map((item) => (
          <div key={item.id} className="reco-item">
            <strong>{item.name}</strong>
            <span>{item.category}</span>
          </div>
        ))}
      </div>

      {recommendations.length === 0 && (
        <p>Aucune recommandation spécifique pour le moment.</p>
      )}
    </div>
  );
}

export default Reco;
