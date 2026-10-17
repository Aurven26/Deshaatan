"use client";
import {createContext,useContext} from 'react';
import type {WebsiteContent} from '@/cms/content';

const Context=createContext<WebsiteContent|null>(null);
export function CMSContentProvider({content,children}:{content:WebsiteContent;children:React.ReactNode}){return <Context.Provider value={content}>{children}</Context.Provider>;}
export function useCMSContent(){const content=useContext(Context);if(!content)throw new Error('CMS content provider is missing.');return content;}
