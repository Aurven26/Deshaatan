const features = [
  {
    title: <>Destination<br />Guides</>,
    description: <>Know before<br />you go</>,
    icon: "/assets/feature-guides.svg",
    className: "guides",
  },
  {
    title: <>Ready<br />Itineraries</>,
    description: <>Real plans for<br />real travellers</>,
    icon: "/assets/feature-ready.svg",
    className: "ready",
  },
  {
    title: <>Curated<br />Holidays</>,
    description: <>Thoughtfully<br />designed trips</>,
    icon: "/assets/feature-holidays.svg",
    className: "holidays",
  },
  {
    title: <>Travel<br />Experts</>,
    description: <>Talk to destination<br />specialists</>,
    icon: "/assets/feature-experts.svg",
    className: "experts",
  },
];

const trustItems = [
  { label: <>Transparent<br />Information</>, icon: "/assets/trust-transparent.svg" },
  { label: <>Real<br />Experiences</>, icon: "/assets/trust-experiences.svg" },
  { label: <>Better<br />Journeys</>, icon: "/assets/trust-journeys.svg" },
  { label: <>Clear<br />Pricing</>, icon: "/assets/trust-pricing.svg" },
];

export default function Home() {
  return (
    <main className="page-shell">
      <div className="design-canvas">
        <img className="hero-art" src="/assets/hero.png" alt="Traveller looking over a mountain lake" />

        <section className="content" aria-labelledby="coming-soon-heading">
          <img className="brand-logo" src="/assets/brand-logo.svg" alt="Deshaatan" />

          <div className="intro">
            <p className="eyebrow">A SMARTER WAY TO TRAVEL</p>
            <div className="headline-wrap">
              <h1 id="coming-soon-heading">Coming <span>Soon</span></h1>
              <img className="headline-rays" src="/assets/headline-rays.svg" alt="" />
              <img className="headline-underline" src="/assets/headline-underline.svg" alt="" />
            </div>
            <p className="subheading">India&apos;s new travel discovery and trip-planning platform.</p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article className={`feature-card ${feature.className}`} key={feature.className}>
                <span className="feature-icon-shell">
                  <img src={feature.icon} alt="" />
                </span>
                <h2>{feature.title}</h2>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>

          <div className="trust-bar" aria-label="Why travellers can trust Deshaatan">
            {trustItems.map((item, index) => (
              <div className="trust-group" key={index}>
                {index > 0 && <span className="trust-separator" aria-hidden="true" />}
                <div className="trust-item">
                  <img src={item.icon} alt="" />
                  <span>{item.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="footer-note">
            <span className="footer-emblem" aria-hidden="true" />
            <span>PLAN SMARTER. TRAVEL BETTER.</span>
            <span className="footer-rule" aria-hidden="true" />
          </div>
        </section>
      </div>
    </main>
  );
}
