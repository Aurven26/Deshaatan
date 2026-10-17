'use client';

import {ArrayField, BlocksField, FieldLabel, Popup, PopupList, useField} from '@payloadcms/ui';
import type {ArrayFieldClientProps, BlocksFieldClientProps} from 'payload';
import {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

type VisibilityProps = {visibilityPath: string};

export function SectionLabel({label, path, visibilityPath, readOnly, required}: VisibilityProps & {label: string; path?: string; readOnly?: boolean; required?: boolean}) {
  const {value, setValue} = useField<boolean>({path: visibilityPath});
  return <span style={{display:'flex',alignItems:'center',gap:12,justifyContent:'space-between',width:'100%'}}>
    <FieldLabel label={label} path={path || visibilityPath} required={required}/>
    <span style={{display:'flex',alignItems:'center',gap:8}}>{value === false && <small>Hidden on website</small>}
      <Popup button={<span aria-label={`Section options: ${label}`}>•••</span>} render={({close})=><PopupList.ButtonGroup><PopupList.Button disabled={readOnly} onClick={()=>{setValue(value === false);close();}}>{value === false ? 'Show section' : 'Hide section'}</PopupList.Button></PopupList.ButtonGroup>}/>
    </span>
  </span>;
}

/** Payload has no ClipboardAction extension slot. Add one scoped React menu item
 * to its portalled menu, retaining the library's own copy/paste implementations. */
function MenuExtension({children, visibilityPath, readOnly}: VisibilityProps & {children: React.ReactNode; readOnly?: boolean}) {
  const root = useRef<HTMLDivElement>(null);
  const {value, setValue} = useField<boolean>({path: visibilityPath});
  const [watching, setWatching] = useState(false);
  const [menu, setMenu] = useState<Element | null>(null);
  useEffect(()=>{
    if (!watching) return;
    let ownedPopup: Element | null = null;
    const findMenu = () => {
      // Once bound, never follow another field's popup when this one closes.
      if (ownedPopup) {
        if (!ownedPopup.isConnected || !ownedPopup.matches('.popup__content')) {setMenu(null);setWatching(false);}
        return;
      }
      const candidates = [...document.querySelectorAll('.popup__content .popup-button-list')];
      const candidate = candidates.at(-1) || null;
      if (candidate) {ownedPopup=candidate.closest('.popup__content');setMenu(candidate);}
    };
    const observer = new MutationObserver(findMenu);
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
    const frame = requestAnimationFrame(findMenu);
    return ()=>{observer.disconnect();cancelAnimationFrame(frame);};
  },[watching]);
  return <div ref={root} onClickCapture={event=>{
    const target = event.target as Element;
    const header = target.closest('.array-field__header-actions, .blocks-field__header-actions');
    const field = target.closest('.array-field, .blocks-field');
    if (header && target.closest('.clipboard-action__popup') && field?.parentElement === root.current) setWatching(true);
  }}>
    {value === false && <p style={{margin:'0 0 8px',color:'var(--theme-warning-600)'}}>Hidden on website — content is preserved.</p>}
    {children}
    {menu && createPortal(<PopupList.Button disabled={readOnly} onClick={()=>{
      setValue(value === false);
      setMenu(null);setWatching(false);
      // Let Payload close its own popup without mutating its component state.
      const trigger = root.current?.querySelector(':scope > .array-field > .array-field__header .clipboard-action__popup button, :scope > .blocks-field > .blocks-field__header .clipboard-action__popup button') as HTMLButtonElement | null;
      trigger?.click();
    }}>{value === false ? 'Show section' : 'Hide section'}</PopupList.Button>,menu)}
  </div>;
}

export function SectionArray(props: ArrayFieldClientProps & VisibilityProps) {
  return <MenuExtension visibilityPath={props.visibilityPath} readOnly={props.readOnly}><ArrayField {...props}/></MenuExtension>;
}
export function SectionBlocks(props: BlocksFieldClientProps & VisibilityProps) {
  return <MenuExtension visibilityPath={props.visibilityPath} readOnly={props.readOnly}><BlocksField {...props}/></MenuExtension>;
}
