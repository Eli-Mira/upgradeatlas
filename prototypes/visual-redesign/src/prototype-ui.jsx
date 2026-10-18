import {word} from './prototype-data.js'
export function Arrow() { return <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5"/></svg> }
export function Dialog({dialogRef,title,children,lang,id}) {
  return <dialog ref={dialogRef} className="dialog" aria-labelledby={id}>
    <header className="dialog-head"><h2 id={id}>{title}</h2><form method="dialog"><button className="icon-button" aria-label={word(lang,'Close dialog','أغلق النافذة')}>×</button></form></header>
    <div className="dialog-body">{children}</div>
  </dialog>
}
