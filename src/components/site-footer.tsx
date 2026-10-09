"use client";

const mainLinks = [
  ["Package Tours", "/tour-packages"], ["Top Tourist Attractions of India", "/#guides"],
  ["Best Hotel Chains in India", "/#guides"], ["Corporate Tour", "/#itinerary"],
  ["Company Profile", "/about-us"], ["Contact Us", "/contact-us"], ["Rent A Car", ""],
];
const quickLinks = ["About Us", "FAQ", "We are Hiring", "Partner With Deshaatan", "Cancellation & Refund Policy"];
const routes: Record<string, string> = {
  "FAQ": "/faq",
  "About Us": "/about-us", "Terms & Conditions": "/terms-and-conditions", "Privacy Policy": "/privacy-policy",
  "Copyright Policies": "/copyright-policy", "Cancellation & Refund Policy": "/refund-and-cancellation-policy",
};
function FooterAsset({ name, extension = "svg" }: { name: string; extension?: string }) {
  return <picture><source media="(max-width: 600px)" srcSet={`/figma/footer/mobile-${name}.${extension}`} /><img src={`/figma/footer/desktop-${name}.${extension}`} alt="" /></picture>;
}
export function SiteFooter({ onInfo, onRentCar }: { onInfo: (title: string) => void; onRentCar: () => void }) {
  const link = (label: string) => routes[label] ? <a key={label} href={routes[label]}>{label}</a> : <button key={label} onClick={() => onInfo(label)}>{label}</button>;
  const mainLink = ([label, href]: string[]) => label === "Rent A Car" ? <button key={label} onClick={onRentCar}>{label}</button> : <a key={label} href={href}>{label}</a>;
  return <footer className="site-footer">
    <div className="footer-main">
      <div className="footer-company">
        <a href="/" aria-label="Deshaatan home"><FooterAsset name="img2490934664304" /></a>
        <p>Deshaatan helps travellers discover India through thoughtful itineraries, trusted local expertise, memorable stays, iconic landmarks, and authentic hidden gems<span className="footer-desktop-space">.&nbsp; </span><span className="footer-mobile-space"> </span><a href="/about-us"><span className="desktop-only">Read more</span><span className="mobile-only">Read more.....</span></a></p>
        <address>
          <a href="tel:+917065780780"><FooterAsset name="imgVuesaxLinearCallCalling" />07065780780</a>
          <a href="mailto:care@deshaatan.com"><FooterAsset name="imgVuesaxLinearSms" />care@deshaatan.com</a>
          <span><FooterAsset name="imgVuesaxLinearLocation" /><span>Cabin 21, Ground Floor, H-187, Lohia Rd,<br />H Block, Sector 63, Noida, Uttar Pradesh 201301</span></span>
        </address>
      </div>
      <div className="footer-menu"><h3>IN THE MAIN SECTION</h3>{mainLinks.map(mainLink)}</div>
      <div className="footer-menu"><h3>QUICK LINKS</h3>{quickLinks.map(link)}</div>
      <div className="mobile-footer-menu mobile-only">
        <details><summary>In The Main Section<span className="footer-arrow"><img src="/figma/footer/mobile-imgVector.svg" alt="" /></span></summary><div>{mainLinks.map(mainLink)}</div><img className="footer-divider" src="/figma/footer/mobile-imgLine161.svg" alt="" /></details>
        <details><summary>Quick links<span className="footer-arrow"><img src="/figma/footer/mobile-imgVector.svg" alt="" /></span></summary><div>{quickLinks.map(link)}</div><img className="footer-divider" src="/figma/footer/mobile-imgLine161.svg" alt="" /></details>
      </div>
      <div className="footer-social"><h3><span className="desktop-only">FOLLOW US</span><span className="mobile-only">Follow Us</span></h3><div>{[["Facebook", "imgContainer"], ["Twitter", "imgContainer1"], ["Instagram", "imgContainer2"], ["YouTube", "imgContainer3"]].map(([label, name]) => <button className={`footer-social-${label.toLowerCase()}`} key={label} aria-label={label} onClick={() => onInfo("Follow Deshaatan on " + label)}><FooterAsset name={name} extension="png" /></button>)}</div></div>
    </div>
    <div className="footer-bottom desktop-only"><p>© 2026 Deshaatan.com All rights reserved.</p><div>{["Terms & Conditions", "About Us", "Privacy Policy", "Copyright Policies"].map(link)}</div></div>
    <div className="mobile-footer-bottom mobile-only"><p>Copyright © Deshaatan. All Rights Reserved.</p><div>{["About Us", "Privacy Policy", "Copyright Policies", "Terms & Conditions"].map(link)}</div></div>
  </footer>;
}
