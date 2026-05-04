import React from "react";
import Product from "./components/Product";

function App() {
  return (
    <div style={{ background: "#0f0f1a", minHeight: "100vh", padding: "24px" }}>
      <h2
        style={{ color: "#ef4444", marginBottom: "16px", textAlign: "center" }}
      >
        Product MFE - Standalone
      </h2>
      <Product />
    </div>
  );
}

export default App;
