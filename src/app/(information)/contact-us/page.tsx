import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Contact Us | Deshaatan", description: "Contact Deshaatan by email, phone or at our Noida office. We are always here to help." };
const asset = (name: string, ext = "svg") => `/figma/information/${name}.${ext}`;
const address = "Cabin 21, Ground Floor, H-187, Lohia Rd,\nH Block, Sector 63, Noida, Uttar Pradesh 201301";
const mapsUrl = "https://www.google.com/maps/place/WorkWings+Coworking+Space/@28.6291958,77.3804614,688m/data=!3m2!1e3!4b1!4m6!3m5!1s0x390ceff845df14d9:0xa0a97bdb85d0a42f!8m2!3d28.6291958!4d77.3804614!16s%2Fg%2F11ddwhzvwb?entry=ttu&g_ep=EgoyMDI2MTAwNS4wIKXMDSoASAFQAw%3D%3D";
export default function ContactPage() {
  return <main id="information-content" className="contact-page">
    <div className="contact-copy">
      <nav className="contact-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">〉</span><span aria-current="page">Contact us</span></nav>
      <h1>Contact us</h1><p className="contact-subtitle">We are always here to help what you need.</p>
      <div className="contact-details">
        <a className="contact-item" href="mailto:care@deshaatan.com"><span className="contact-icon"><img src={asset("imgGroup858")} alt="" /></span><div><h2>Email</h2><p>care@deshaatan.com</p></div></a>
        <a className="contact-item" href="https://www.instagram.com/plan.deshaatan/" target="_blank" rel="noopener noreferrer"><span className="contact-icon"><img src={asset("imgAkarIconsInstagramFill")} alt="" /></span><div><h2>Social Media</h2><p>plan.deshaatan</p></div></a>
        <a className="contact-item" href={mapsUrl} target="_blank" rel="noopener noreferrer"><span className="contact-icon"><img src={asset("imgGroup779")} alt="" /></span><div><h2>Location</h2><address>Cabin 21, Ground Floor, H-187, Lohia Rd,<br />H Block, Sector 63, Noida, Uttar Pradesh 201301</address></div></a>
        <a className="contact-item" href="tel:+917065780780"><span className="contact-icon"><img src={asset("imgPhPhoneCall")} alt="" /></span><div><h2>Phone</h2><p>07065780780</p></div></a>
      </div>
    </div>
    <a className="contact-map" href={mapsUrl} target="_blank" rel="noopener noreferrer" aria-label="Open Deshaatan office at WorkWings Coworking Space in Google Maps">
      <img className="contact-map-image" src={asset("imgMap", "png")} alt="Map showing Deshaatan's office in Sector 63, Noida" />
      <span className="map-marker" aria-hidden="true">{["imgGroup", "imgGroup1", "imgGroup2", "imgGroup3"].map(name => <img key={name} src={asset(name)} alt="" />)}</span>
      <span className="map-tooltip"><span>{address}</span><img src={asset("imgArrow")} alt="" /></span>
    </a>
  </main>;
}
