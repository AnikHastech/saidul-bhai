// Compare tray — up to 4 products held for side-by-side comparison.
import { createListStore } from './persistent';

export const COMPARE_CAP = 4;
export const compare = createListStore('asmaz:compare', { cap: COMPARE_CAP });
export const $compare = compare.$items;
