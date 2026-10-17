import type {Access, FieldAccess} from 'payload';

export const isAdmin:Access=({req})=>req.user?.role==='admin';
export const isEditor:Access=({req})=>req.user?.role==='admin' || req.user?.role==='editor';
export const isStaff=({req}:{req:import('payload').PayloadRequest})=>!!req.user && ['admin','editor','support'].includes(req.user.role);
export const adminField:FieldAccess=({req})=>req.user?.role==='admin';
export const published:Access=({req})=>req.user && ['admin','editor'].includes(req.user.role) ? true : {_status:{equals:'published'}};
export const ownUser:Access=({req})=>req.user?.role==='admin' ? true : req.user ? {id:{equals:req.user.id}} : false;
