export default function Hero({ onShopNow }) {
  return (
    <section className="hero">
      <div className="hero-inner container">
        <div className="hero-text">
          <p className="hero-tag">Curated for you</p>
          <h1 className="hero-title">Where beauty meets <em>self-care.</em></h1>
          <p className="hero-subtitle">
            Thoughtfully selected lip care and signature fragrances.
            All the small indulgences, in one place.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={onShopNow}>
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
