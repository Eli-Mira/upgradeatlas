import StudioLaptop from '../motion/StudioLaptop.jsx'
import {Arrow} from './prototype-ui.jsx'
import {word,link,visuals} from './prototype-data.js'

export default function Home({lang}) {
  const t=(en,ar)=>word(lang,en,ar)
  return <>
    <section className="hero wrap" aria-labelledby="home-title">
      <div className="hero-copy">
        <p className="eyebrow">{t('For the laptop you need. And the one you own.','للابتوب اللي تحتاجه، واللي معاك بالفعل.')}</p>
        <h1 id="home-title"><span>{t('Know your','اختيار أذكى.')}</span><span>{t('next move.','لابتوب أنسب.')}</span></h1>
        <p className="hero-lead">{t('Choose your next laptop with clarity. Or discover whether the one you own deserves another chapter.','اختَر لابتوبك القادم بوضوح، أو قارن تكلفة تطوير الجهاز اللي معاك قبل ما تستبدله.')}</p>
        <div className="hero-actions"><a className="button primary" href={link('/laptops',lang)}>{t('Explore laptops','استكشف اللابتوبات')}<Arrow/></a><a className="text-link secondary-desktop" href={link('/calculator',lang)}>{t('Compare upgrade costs','قارن تكلفة الترقية')}</a></div>
      </div>
      <figure className="hero-visual"><StudioLaptop locale={lang}/><figcaption>{t('Original concept study. Not a retail model.','تصميم توضيحي أصلي، وليس موديلًا معروضًا للبيع.')}</figcaption></figure>
      <a className="text-link secondary-mobile" href={link('/calculator',lang)}>{t('Already own a laptop? Compare upgrade costs.','عندك لابتوب بالفعل؟ قارن تكلفة تطويره.')}<Arrow/></a>
    </section>
    <section className="search-strip wrap" aria-label={t('Search the illustrative catalog','ابحث في الكتالوج التوضيحي')}>
      <div><h2>{t('Have a model in mind?','عندك موديل في بالك؟')}</h2><p>{t('Try the fictional configurations in this design study.','جرّب البحث في التكوينات الافتراضية في نموذج التصميم.')}</p></div>
      <form action="/laptops" method="get"><input type="hidden" name="lang" value={lang}/><label className="visually-hidden" htmlFor="home-search">{t('Search concept laptops','ابحث عن لابتوب توضيحي')}</label><input id="home-search" type="search" name="q" placeholder={t('Try Studio 14 or creative…','جرّب Studio 14 أو عمل إبداعي…')} autoComplete="off"/><button className="search-button" aria-label={t('Search laptops','ابحث عن لابتوب')}><Arrow/></button></form>
    </section>
    <section className="principles wrap" aria-label={t('A clearer decision','قرار أوضح')}>
      <article><span className="line-symbol"/><h2>{t('Configuration first.','التكوين أولًا.')}</h2><p>{t('A family name is not enough. The exact configuration is what makes a comparison useful.','اسم العائلة وحده مش كفاية. التكوين الدقيق هو أساس المقارنة المفيدة.')}</p></article>
      <article><span className="line-symbol double"/><h2>{t('Evidence, not assumptions.','مصادر، مش افتراضات.')}</h2><p>{t('Unknown information should stay visible—not become a confident-looking specification.','المعلومة غير المعروفة لازم تفضل واضحة، بدل ما تتحوّل لمواصفة تبدو مؤكدة.')}</p></article>
      <article><span className="line-symbol triple"/><h2>{t('Costs without promises.','تكاليف من غير وعود.')}</h2><p>{t('Compare the amounts you enter. A lower bill is not a promise of better performance.','قارن الأرقام اللي تدخلها. التكلفة الأقل مش وعدًا بأداء أفضل.')}</p></article>
    </section>
    <section className="second-act wrap">
      <div className="detail-art"><img src={visuals[1]} width="1920" height="1080" loading="lazy" alt={t('Overhead view of the original laptop concept','منظور علوي لتصميم اللابتوب التوضيحي')}/><span>{t('Look closer before starting over.','بُصّ أقرب، قبل ما تبدأ من جديد.')}</span></div>
      <div className="second-copy"><p className="eyebrow">{t('Keep the useful. Rethink the rest.','حافظ على اللي ينفعك، وراجع الباقي.')}</p><h2>{t('A good laptop can have a second act.','لابتوبك ممكن يستاهل فرصة تانية.')}</h2><p>{t('Start with what you own. Compare memory, storage and installation costs with the replacement cost you enter. The decision stays yours.','ابدأ بالجهاز اللي معاك. قارن تكلفة الرام والتخزين والتركيب بتكلفة البديل اللي تدخلها. القرار يفضل قرارك.')}</p><a className="button outline" href={link('/calculator',lang)}>{t('Open the cost workbench','افتح مساحة مقارنة التكاليف')}<Arrow/></a></div>
    </section>
  </>
}
