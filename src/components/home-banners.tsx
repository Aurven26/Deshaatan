"use client";

import {useEffect, useRef, useState, type CSSProperties} from "react";
import s from "./home-banners.module.css";
import {useCMSContent} from './cms-content';


export default function HomeBanners() {
  const {homePage:{hero}}=useCMSContent();
  const banners=hero.banners.filter(banner=>banner.visible);
  const [index,setIndex] = useState(0);
  const [playing,setPlaying] = useState(hero.autoplay);
  const [hovered,setHovered] = useState(false);
  const [focused,setFocused] = useState(false);
  const touch = useRef<number|null>(null);
  const advance = (direction:number) => setIndex(value=>(value+direction+banners.length)%banners.length);
  useEffect(()=>{
    if(!hero.enabled || !banners.length || !playing || hovered || focused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer=window.setInterval(()=>setIndex(value=>(value+1)%banners.length),hero.interval*1000);
    return ()=>window.clearInterval(timer);
  },[playing,hovered,focused,hero.enabled,hero.interval,banners.length]);

  if(!hero.enabled || !banners.length)return null;
  return <section className={s.carousel} aria-label="Explore India banners" aria-roledescription="carousel"
    onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
    onFocusCapture={()=>setFocused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setFocused(false);}}
    onKeyDown={event=>{if(event.key==="ArrowLeft"){event.preventDefault();advance(-1);}if(event.key==="ArrowRight"){event.preventDefault();advance(1);}}}
    onTouchStart={event=>{touch.current=event.touches[0].clientX;}}
    onTouchEnd={event=>{if(touch.current!==null){const distance=touch.current-event.changedTouches[0].clientX;if(Math.abs(distance)>40)advance(distance>0?1:-1);}touch.current=null;}}>
    {[-1,0,1].map(offset=>{
      const position=((index%banners.length)+offset+banners.length)%banners.length;
      const banner=banners[position];
      const crop=[banner.width,banner.height,banner.left,banner.top];
      const style=crop ? {"--photo-width":`${crop[0]}%`,"--photo-height":`${crop[1]}%`,"--photo-left":`${crop[2]}%`,"--photo-top":`${crop[3]}%`} as CSSProperties : undefined;
      const href=banner.href || (banner.destination ? `/tour-packages?destination=${encodeURIComponent(banner.destination)}` : "/tour-packages");
      return <div key={offset} className={`${s.panel} ${offset<0?s.previous:offset>0?s.next:s.current}`} data-banner={banner.artworkOnly?"india":banner.key} style={style} aria-hidden={offset!==0} inert={offset!==0} role="group" aria-roledescription="slide" aria-label={`${position+1} of ${banners.length}: ${banner.title}`}>
        <img className={s.photo} src={banner.image} alt={banner.alt} fetchPriority={offset===0?"high":"auto"} />
        {/* Document navigation opens every banner destination at the page start. */}
        {banner.artworkOnly ? <a className={s.artLink} href={href} aria-label={banner.action} /> : <>
          <div className={s.overlay} />
          <div className={s.copy}><span className={s.badge}>{banner.badge}</span><h2>{banner.title}</h2><p>{banner.tagline}</p><a className={s.cta} href={href}>{banner.action}<img src="/figma/home-banners/arrow-right.svg" alt="" /></a></div>
        </>}
      </div>;
    })}
    <div className={s.controls}>
      <button aria-label="Previous banner" onClick={()=>advance(-1)}>‹</button>
      <button aria-label={playing?"Pause slideshow":"Play slideshow"} aria-pressed={playing} onClick={()=>setPlaying(value=>!value)}>{playing?"Ⅱ":"▷"}</button>
      <span aria-live={playing?"off":"polite"}>{(index%banners.length)+1} / {banners.length}</span>
      <button aria-label="Next banner" onClick={()=>advance(1)}>›</button>
    </div>
  </section>;
}
