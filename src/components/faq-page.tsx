"use client";

import { useState } from "react";
import categories from "@/data/faq.json";
import styles from "./faq-page.module.css";

export default function FaqPage() {
  const [filter, setFilter] = useState("all");
  const [openQuestion, setOpenQuestion] = useState<string | null>(`${categories[0].id}-0`);
  const selectCategory = (id: string) => {
    setFilter(id);
    setOpenQuestion(`${id === "all" ? categories[0].id : id}-0`);
  };
  const shown = filter === "all" ? categories : categories.filter(category => category.id === filter);

  return <main id="information-content" className={styles.page}>
    <div className={styles.decorations} aria-hidden="true">
      <span className={styles.blob} />
      <img className={styles.ring} src="/figma/faq/imgDecoRing.png" alt="" width="44" height="44" />
      <img className={styles.dot} src="/figma/faq/imgDecoDot.svg" alt="" />
    </div>
    <div className={styles.container}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">›</span><span aria-current="page">FAQs</span></nav>
      <div className={styles.hero}>
        <span className={styles.tag}>HELP CENTRE</span>
        <h1>Frequently asked<br /><span>questions</span></h1>
        <p>Have a question about planning or booking a trip with Deshaatan? You&apos;ll find answers to the most common ones below. If you don&apos;t see your question here, write to us at <a href="mailto:care@deshaatan.com">care@deshaatan.com</a> or call <a href="tel:+917065780780">07065780780</a>.</p>
        <div className={styles.filters} aria-label="FAQ categories">
          <button type="button" aria-pressed={filter === "all"} onClick={() => selectCategory("all")}>All</button>
          {categories.map(category => <button key={category.id} type="button" aria-pressed={filter === category.id} onClick={() => selectCategory(category.id)}>{category.chip}</button>)}
        </div>
      </div>
      <div className={styles.layout}>
        <div className={styles.list}>
          {shown.map(category => <section key={category.id} id={category.id} className={styles.category} aria-labelledby={`${category.id}-heading`}>
            <div className={styles.categoryHeading}><span>{String(categories.indexOf(category) + 1).padStart(2, "0")}</span><h2 id={`${category.id}-heading`}>{category.title}</h2><p>{category.items.length} questions</p></div>
            {category.items.map((item, index) => {
              const key = `${category.id}-${index}`;
              const open = openQuestion === key;
              return <article key={key} className={`${styles.item} ${open ? styles.open : ""}`}>
                <h3><button type="button" aria-expanded={open} aria-controls={`${key}-answer`} onClick={() => setOpenQuestion(previous => previous === key ? null : key)}><span>{item.question}</span><span className={styles.toggle} aria-hidden="true" /></button></h3>
                <div id={`${key}-answer`} hidden={!open}><p>{item.answer}</p></div>
              </article>;
            })}
          </section>)}
        </div>
        <aside className={styles.help} aria-labelledby="faq-help-heading">
          <span className={styles.emailBadge}><img src="/figma/faq/imgGroup858.svg" alt="" /></span>
          <h2 id="faq-help-heading">Still have questions?</h2>
          <p>Can&apos;t find the answer you&apos;re looking for? Our team is happy to help you plan, book or sort out an existing trip.</p>
          <span className={styles.spacer} aria-hidden="true" />
          <a className={styles.emailButton} href="mailto:care@deshaatan.com">Email us</a>
          <a className={styles.callButton} href="tel:+917065780780">Call 07065780780</a>
        </aside>
      </div>
    </div>
  </main>;
}
