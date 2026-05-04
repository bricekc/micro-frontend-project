import React, { Suspense, useState, useEffect } from "react";
import "./App.css";

// Composant de fallback quand un MFE est indisponible
function OfflineFallback({ name }) {
  return <div className="error-fallback">{name} indisponible</div>;
}

function LoadingFallback({ name }) {
  return <div className="loading-fallback">Chargement {name}...</div>;
}

// Wrapper resilient : charge le MFE ou affiche un fallback
function RemoteMFE({ name, importFn }) {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    importFn()
      .then((mod) => {
        if (!cancelled) {
          setComponent(() => mod.default);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn(`[MFE] ${name} indisponible :`, err.message);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingFallback name={name} />;
  if (error || !Component) return <OfflineFallback name={name} />;
  return <Component />;
}

function App() {
  return (
    <div className="shell">
      <main className="shell-content">
        <div className="content-grid-3">
          <section className="section">
            <RemoteMFE name="Cart" importFn={() => import("mfeCart/Cart")} />
          </section>

          <section className="section">
            <RemoteMFE
              name="Product"
              importFn={() => import("mfeProduct/Product")}
            />
          </section>

          <section className="section">
            <RemoteMFE name="Reco" importFn={() => import("mfeReco/Reco")} />
          </section>
        </div>
      </main>

      <footer className="shell-footer">
        <p>Shell (3000) | Product (3001) | Cart (3002) | Reco (3003)</p>
      </footer>
    </div>
  );
}

export default App;
