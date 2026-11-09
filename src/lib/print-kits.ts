import raw from '../data/print-kits.json';
import type {Case} from './cases';
import {casePath} from './cases';

export type PrintKit = (typeof raw.cases)[number];
export const printKits:PrintKit[] = raw.cases.filter(kit=>kit.published);
export const printKitForCase=(item:Case)=>printKits.find(kit=>kit.case_id===item.id);
export const printKitPath=(item:Case)=>casePath(item)+'kit-boca-a-boca/';
export const printCaseUrl=(item:Case)=>raw.public_url_origin.replace(/\/$/,'')+casePath(item);
export const printKitUrl=(item:Case)=>raw.public_url_origin.replace(/\/$/,'')+printKitPath(item);
export const printableCases=(cases:Case[])=>cases.filter(item=>Boolean(printKitForCase(item)));
export const printPolicy=raw.policy;
export const printReviewedAt=raw.updated_at;
