"use client";
import { useState, type ReactNode } from "react";
import { SiteHeader, SiteFooter } from "./site-chrome";
import { SiteDialog, type Modal } from "./site-dialog";

export default function InformationShell({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<Modal | null>(null);
  const [notice, setNotice] = useState("");
  return <div className="information-site">
    <a className="skip-link" href="#information-content">Skip to content</a>
    <SiteHeader onAction={(kind, title) => setModal({ kind, title })} />
    {children}
    <SiteFooter onInfo={title => setModal({ kind: "info", title })} onRentCar={() => setModal({kind:"car-rental",title:"Rent A Car"})} />
    <SiteDialog modal={modal} setModal={setModal} onNotice={setNotice} />
    {notice && <div role="status" className="information-notice">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss notification">×</button></div>}
  </div>;
}
