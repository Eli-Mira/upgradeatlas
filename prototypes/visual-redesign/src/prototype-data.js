export const visuals = [
  new URL('../assets/catalog-01.webp', import.meta.url).href,
  new URL('../assets/catalog-02.webp', import.meta.url).href,
  new URL('../assets/catalog-03.webp', import.meta.url).href,
]

// Fictional configurations for design evaluation, never a real product feed.
export const concepts = [
  {id:'studio14',name:'Studio 14',screen:14,ram:16,ssd:512,cores:8,price:32000,use:'creative',image:0},
  {id:'field15',name:'Field 15',screen:15.6,ram:8,ssd:512,cores:6,price:22000,use:'study',image:1},
  {id:'vector16',name:'Vector 16',screen:16,ram:32,ssd:1024,cores:12,price:58000,use:'performance',image:2},
  {id:'orbit13',name:'Orbit 13',screen:13.3,ram:16,ssd:512,cores:8,price:38000,use:'work',image:0},
  {id:'craft16',name:'Craft 16',screen:16,ram:32,ssd:1024,cores:12,price:72000,use:'creative',image:1},
  {id:'base15',name:'Base 15',screen:15.6,ram:8,ssd:256,cores:4,price:18000,use:'study',image:2},
]

export const word = (lang,en,ar) => lang === 'ar' ? ar : en
export const number = (value,lang) => new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-EG', {maximumFractionDigits:2}).format(value)
export const money = (value,lang) => new Intl.NumberFormat(lang === 'ar' ? 'ar-EG' : 'en-EG', {style:'currency',currency:'EGP',maximumFractionDigits:2}).format(value)
export const link = (path,lang,query='') => `${path}?lang=${lang}${query ? `&q=${encodeURIComponent(query)}` : ''}`
export const purposeLabel = (key,lang) => ({all:word(lang,'All uses','كل الاستخدامات'),study:word(lang,'Study & everyday','دراسة واستخدام يومي'),work:word(lang,'Work & development','عمل وبرمجة'),creative:word(lang,'Creative work','عمل إبداعي'),performance:word(lang,'Performance-focused','أداء مكثف')})[key]
