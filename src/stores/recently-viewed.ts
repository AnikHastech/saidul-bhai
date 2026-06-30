// Recently viewed — last N products the visitor opened (PDP).
// Front-inserted, capped; rendered in the "Recently viewed" strip.
import { createListStore } from './persistent';

export const RECENT_CAP = 12;
export const recentlyViewed = createListStore('asmaz:recently-viewed', { cap: RECENT_CAP });
export const $recentlyViewed = recentlyViewed.$items;
