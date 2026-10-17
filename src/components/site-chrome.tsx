"use client";
import { useEffect, useRef, useState } from "react";
import {useCMSContent} from './cms-content';
import {sectionVisible} from '@/cms/visibility-labels';
const asset = (name: string, extension = "svg") => `/figma/${name}.${extension}`;
function Icon({name, className = ""}: {name: string; className?: string}) { return <img className={`icon ${className}`} src={asset(name)} alt="" />; }
export function SiteHeader({onAction}: {onAction: (kind: "search" | "login", title: string) => void; home?: boolean}) {
 const {visibility,navigation,homePage:{header:h}}=useCMSContent();
 // Temporarily hide Guides in both desktop and mobile navigation.
 const nav=navigation.filter(([label])=>h.showGuides || label.toLowerCase()!=="guides");
 const [menuOpen, setMenuOpen] = useState(false);
 const headerRef = useRef<HTMLElement>(null);
 useEffect(() => {
   let frame = 0;
   const update = () => { frame = 0; if (headerRef.current) headerRef.current.dataset.scrolled = String(window.scrollY > 50); };
   const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
   update(); window.addEventListener("scroll", scroll, {passive:true});
   return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", scroll); };
 }, []);
 if(!sectionVisible(visibility,"shared","header"))return null;
 return (<header ref={headerRef}>
      {h.promotionVisible && <a className="deal-bar" href={h.promotionURL}><span>{h.promotionTitle} <span className="deal-copy">• &nbsp;{h.promotionText}</span></span><span className="deal-deadline">{h.promotionButton}</span></a>}
      <div className="navbar">
        <a href="/" aria-label={h.logoAlt} className="brand"><img src={h.desktopLogo} alt="" className="desktop-only" /><img src={h.mobileLogo} alt="" className="mobile-only" /></a>
        <button className="mobile-toggle" aria-expanded={menuOpen} aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}><Icon name="mobile-imgMenusBurgerMenuBig" /></button>
        <nav className={menuOpen ? "nav-content open" : "nav-content"} aria-label="Main navigation"><div className="nav-links">{nav.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)}>{label}</a>)}</div><div className="nav-actions">
          {h.showSearch && <button className="search-button" aria-label="Search itineraries and guides" onClick={() => onAction("search", "Where would you like to go?")}><Icon name="imgImage18" /></button>}
          {h.showCurrency && <div className="currency"><span className="flag-sprite"><img src={asset("imgText", "png")} alt="India" /></span><span>{h.currency}</span></div>}
          {h.showLogin && <button className="login" onClick={() => onAction("login", "Welcome to Deshaatan")}>Login</button>}
        </div><a className="contact-button" href={h.contactURL} onClick={() => setMenuOpen(false)}>{h.contactLabel}</a></nav>
      </div>
    </header>);
}
export { SiteFooter } from "./site-footer";
