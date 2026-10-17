"use client";
import {Fragment} from 'react';
import {useCMSContent} from './cms-content';
import {sectionVisible} from '@/cms/visibility-labels';

function FooterAsset({ name, extension = "svg" }: { name: string; extension?: string }) {
  return <picture><source media="(max-width: 600px)" srcSet={`/figma/footer/mobile-${name}.${extension}`} /><img src={`/figma/footer/desktop-${name}.${extension}`} alt="" /></picture>;
}
export function SiteFooter({ onInfo, onRentCar }: { onInfo: (title: string) => void; onRentCar: () => void }) {
  const {visibility,settings,homePage:{footer:f}}=useCMSContent();
  const actions:Record<string,string>={corporate:"Corporate Tour",hiring:"We are Hiring",partner:"Partner With Deshaatan"};
  if(!f.enabled || !sectionVisible(visibility,"shared","footer"))return null;
  const link=(item:{label:string;href:string;action:string})=>item.action==="car-rental"?<button key={item.label} onClick={onRentCar}>{item.label}</button>:item.action==="link"&&item.href?<a key={item.label} href={item.href}>{item.label}</a>:<button key={item.label} onClick={()=>onInfo(actions[item.action]||item.label)}>{item.label}</button>;
  return <footer className="site-footer">
    <div className="footer-main">
      <div className="footer-company">
        <a href="/" aria-label="Deshaatan home"><picture><img src={f.logo} alt="" /></picture></a>
        <p>{f.description} <a href={f.aboutURL}>{f.readMore}</a></p>
        <address>
          <a href={`tel:${settings.phone.replace(/[^+0-9]/g,'')}`}><FooterAsset name="imgVuesaxLinearCallCalling" />{settings.phone}</a>
          <a href={`mailto:${settings.email}`}><FooterAsset name="imgVuesaxLinearSms" />{settings.email}</a>
          <span><FooterAsset name="imgVuesaxLinearLocation" /><span>{settings.address.split('\n').map((line,index)=><Fragment key={index}>{index>0 && <br/>}{line}</Fragment>)}</span></span>
        </address>
      </div>
      <div className="footer-menu"><h3>{f.mainTitle}</h3>{f.mainLinks.map(link)}</div>
      <div className="footer-menu"><h3>{f.quickTitle}</h3>{f.quickLinks.map(link)}</div>
      <div className="mobile-footer-menu mobile-only">
        <details><summary>{f.mainTitle}<span className="footer-arrow"><img src="/figma/footer/mobile-imgVector.svg" alt="" /></span></summary><div>{f.mainLinks.map(link)}</div><img className="footer-divider" src="/figma/footer/mobile-imgLine161.svg" alt="" /></details>
        <details><summary>{f.quickTitle}<span className="footer-arrow"><img src="/figma/footer/mobile-imgVector.svg" alt="" /></span></summary><div>{f.quickLinks.map(link)}</div><img className="footer-divider" src="/figma/footer/mobile-imgLine161.svg" alt="" /></details>
      </div>
      <div className="footer-social"><h3>{f.socialTitle}</h3><div>{[
        // ["Facebook", "imgContainer"],
        // ["Twitter", "imgContainer1"],
        ["Instagram", "imgContainer2"],
        // ["YouTube", "imgContainer3"],
      ].map(([label, name]) => label === "Instagram" ? <a className={`footer-social-${label.toLowerCase()}`} key={label} aria-label={label} href={settings.instagram?.startsWith("https://") ? settings.instagram : "https://www.instagram.com/plan.deshaatan/"} target="_blank" rel="noreferrer"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none"/></svg></a> : <button className={`footer-social-${label.toLowerCase()}`} key={label} aria-label={label} onClick={() => onInfo("Follow Deshaatan on " + label)}><FooterAsset name={name} extension="png" /></button>)}</div></div>
    </div>
    <div className="footer-bottom desktop-only"><p>{f.copyright}</p><div>{f.legalLinks.map(link)}</div></div>
    <div className="mobile-footer-bottom mobile-only"><p>{f.mobileCopyright}</p><div>{f.legalLinks.map(link)}</div></div>
  </footer>;
}
