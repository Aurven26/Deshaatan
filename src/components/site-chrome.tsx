"use client";
import { useEffect, useRef, useState } from "react";
const asset = (name: string, extension = "svg") => `/figma/${name}.${extension}`;
function Icon({name, className = ""}: {name: string; className?: string}) { return <img className={`icon ${className}`} src={asset(name)} alt="" />; }
export function SiteHeader({onAction, home = false}: {onAction: (kind: "search" | "login", title: string) => void; home?: boolean}) {
 const [menuOpen, setMenuOpen] = useState(false);
 const headerRef = useRef<HTMLElement>(null);
 useEffect(() => {
   let frame = 0;
   const update = () => { frame = 0; if (headerRef.current) headerRef.current.dataset.scrolled = String(window.scrollY > 50); };
   const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
   update(); window.addEventListener("scroll", scroll, {passive:true});
   return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", scroll); };
 }, []);
  const nav = [["About Us", "/about-us"], ["Destinations", "/#destinations"], ["Tour Packages", "/tour-packages"], ["Services", "/#itinerary"], ["Guides", "/#guides"]];
 return (<header ref={headerRef}>
      <a className="deal-bar" href="/tour-packages?deals=week"><span>Deals of The Week <span className="deal-copy">• &nbsp;Solo-Friendly Adventures &nbsp;Up to 50% OFF</span></span><span className="deal-deadline">Deals end:26 Aug, 2026</span></a>
      <div className="navbar">
        <a href="/" aria-label="Deshaatan home" className="brand"><Icon name="img2490934664305" className="desktop-only" /><Icon name="mobile-img2490934664304" className="mobile-only" /></a>
        <button className="mobile-toggle" aria-expanded={menuOpen} aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}><Icon name="mobile-imgMenusBurgerMenuBig" /></button>
        <nav className={menuOpen ? "nav-content open" : "nav-content"} aria-label="Main navigation"><div className="nav-links">{nav.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}</div><div className="nav-actions">
          <button className="search-button" aria-label="Search itineraries and guides" onClick={() => onAction("search", "Where would you like to go?")}><Icon name="imgImage18" /></button>
          <div className="currency"><span className="flag-sprite"><img src={asset("imgText", "png")} alt="India" /></span><span>INR ₹</span></div>
          <button className="login" onClick={() => onAction("login", "Welcome to Deshaatan")}>Login</button>
        </div><a className="contact-button" href="/contact-us" onClick={() => setMenuOpen(false)}>Contact Us</a></nav>
      </div>
    </header>);
}
export { SiteFooter } from "./site-footer";
