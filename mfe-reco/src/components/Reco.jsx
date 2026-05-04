import React, { useEffect, useMemo, useState } from "react";
import eventBus from "shared/eventBus";
import "./Reco.css";

const defaultRecommendations = [
  { id: "snes-mario", name: "SNES - Super Mario World", category: "console", price: 49.99 },
  { id: "n64-mario-kart", name: "N64 - Mario Kart 64", category: "console", price: 54.99 },
  { id: "nes-zelda", name: "NES - The Legend of Zelda", category: "console", price: 39.99 },
  { id: "gameboy-pokemon", name: "Game Boy - Pokémon Red", category: "handheld", price: 44.99 },
];

const complementaryRecommendations = {
  "game boy - tetris": [
    { id: "gameboy-pokemon", name: "Game Boy - Pokémon Red", category: "handheld", price: 44.99 },
  ],
  "snes - super mario world": [
    { id: "n64-mario-kart", name: "N64 - Mario Kart 64", category: "console", price: 54.99 },
    { id: "nes-zelda", name: "NES - The Legend of Zelda", category: "console", price: 39.99 },
  ],
  "nes - the legend of zelda": [
    { id: "snes-mario", name: "SNES - Super Mario World", category: "console", price: 49.99 },
    { id: "n64-mario-kart", name: "N64 - Mario Kart 64", category: "console", price: 54.99 },
  ],
  "genesis - sonic the hedgehog": [
    { id: "snes-mario", name: "SNES - Super Mario World", category: "console", price: 49.99 },
    { id: "gameboy-tetris", name: "Game Boy - Tetris", category: "handheld", price: 29.99 },
  ],
  "atari 2600 - pac-man": [
    { id: "genesis-sonic", name: "Genesis - Sonic The Hedgehog", category: "console", price: 34.99 },
    { id: "gameboy-tetris", name: "Game Boy - Tetris", category: "handheld", price: 29.99 },
  ],
  "n64 - mario kart 64": [
    { id: "snes-mario", name: "SNES - Super Mario World", category: "console", price: 49.99 },
    { id: "nes-zelda", name: "NES - The Legend of Zelda", category: "console", price: 39.99 },
  ],
  "ps1 - crash bandicoot": [
    { id: "n64-mario-kart", name: "N64 - Mario Kart 64", category: "console", price: 54.99 },
    { id: "snes-mario", name: "SNES - Super Mario World", category: "console", price: 49.99 },
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
