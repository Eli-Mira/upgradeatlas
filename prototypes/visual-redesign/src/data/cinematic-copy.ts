import type { Locale } from './copy';

/**
 * Copy for the cinematic field-guide narrative.
 *
 * Kept apart from the interface copy in copy.ts because this is a different
 * register: display headlines, section labels and the narrative lines that
 * carry the scroll story. Both locales are Modern Standard Arabic.
 */
export const cinematic = {
  en: {
    hero: {
      kicker: 'Hardware intelligence · Egypt',
      line1: 'The exact',
      line2: 'machine.',
      sub: 'Sourced gaming-laptop configurations for Egypt. The part number, the memory layout, the storage slots, and the source behind every detail.',
      hint: 'Scroll to explore',
      nodes: [
        'Exact configuration',
        'Memory layout',
        'Storage slots',
        'Source trace',
        'Confidence scoring',
        'Upgrade limits',
        'Family vs SKU',
      ],
      telemetry: [
        { label: 'Profiles filed', value: '04', note: 'sourced records' },
        { label: 'Exact matches', value: '03', note: 'one SKU each' },
        { label: 'Prices', value: 'None', note: 'intentionally omitted' },
      ],
    },
    question: {
      kicker: '01 / The question',
      aside: 'Nothing is only the specifications',
      display: 'A family name is',
      accent: 'not a configuration.',
      body: 'Two machines can share a family name and hide completely different hardware underneath. UpgradeAtlas follows the exact configuration instead: the part number, the memory layout, the storage slots, and the source behind every claim.',
      link: 'Start with the evidence',
      railLeft: 'Specification is a starting point',
      railRight: 'Confidence scores for context',
    },
    desk: {
      kicker: '02 / The research desk',
      aside: 'No retailer pitch',
      display: 'Start with a',
      accent: 'specific machine.',
      link: 'All laptop profiles',
      label: 'Three records from the desk',
    },
    method: {
      kicker: '03 / How we read the hardware',
      aside: 'No retailer pitch',
      display: 'Every claim',
      accent: 'has a footnote.',
      body: 'A specification is useful only when you know which configuration it describes, and where the information came from.',
      principles: [
        {
          title: 'Identify the exact configuration',
          body: 'Exact-model evidence is marked exactly. Family-level information stays labelled as a family reference.',
        },
        {
          title: 'Read the upgrade limits',
          body: 'Memory and storage slots are documented as documented. Missing details stay missing, so do not fill gaps with guesses.',
        },
        {
          title: 'Bring your own buying context',
          body: 'Prices and availability change. Compare user-entered estimates against sourced hardware facts, not invented market data.',
        },
      ],
    },
    hardware: {
      kicker: '04 / The construction',
      aside: 'A conceptual exploded view',
    },
    systems: {
      kicker: '05 / The systems',
      aside: 'Inspectable, not assumed',
      display: 'Smart',
      accent: 'architecture.',
      body: 'Every record is read against the same eight systems. Select one to see what the field guide actually documents about it.',
      nodes: [
        { key: 'processor', label: 'Processor', body: 'The exact part number behind the cores, and where the configuration was confirmed.' },
        { key: 'display', label: 'Display', body: 'Panel size and resolution as recorded. Brightness is not claimed, because it was not measured.' },
        { key: 'memory', label: 'Memory', body: 'Module type, speed, and the physical layout, including how many slots are occupied.' },
        { key: 'storage', label: 'Storage', body: 'Capacity as recorded, and whether the slot count is documented or still unknown.' },
        { key: 'cooling', label: 'Cooling', body: 'Thermal design is noted only where the record states it. Silent load is never assumed.' },
        { key: 'wireless', label: 'Wireless', body: 'The generation of the wireless stack, documented rather than inferred from the model year.' },
        { key: 'audio', label: 'Audio', body: 'Speaker and microphone configuration where the source records it, and marked unknown where it does not.' },
        { key: 'security', label: 'Security', body: 'The security features the record actually names, with no unverified claims attached.' },
      ],
    },
    next: {
      kicker: '06 / The next move',
      aside: 'Tools for a clearer decision',
      display: 'Two ways',
      accent: 'to go further.',
      cards: [
        {
          kicker: 'Compare',
          title: 'Put the details side by side.',
          body: 'Compare up to three researched profiles on the rows that matter.',
          cta: 'Open comparison',
          to: '/compare',
        },
        {
          kicker: 'Upgrade / replace',
          title: 'Run the numbers you actually know.',
          body: 'Enter your own estimates and compare an upgrade against a replacement purchase.',
          cta: 'Open calculator',
          to: '/upgrade',
        },
      ],
    },
    stories: {
      kicker: '07 / Field notes',
      aside: 'Read before you decide',
      display: 'Designed for',
      accent: 'human momentum.',
      stories: [
        {
          label: 'The mobile studio',
          title: 'One bag, one machine, four hours of render.',
          caption: 'A workstation you can carry.',
        },
        {
          label: 'Compile anywhere',
          title: 'The build that finishes on the train.',
          caption: 'Compute follows the person.',
        },
        {
          label: 'Quiet focus',
          title: 'When the fan is the loudest thing in the room.',
          caption: 'Thermals you can hear.',
        },
      ],
    },
    cta: {
      display: 'Enter',
      accent: 'the library.',
      body: 'Six configurations, one honest place to read them. No prices, no stock claims, no invented specifications.',
      cta: 'Browse the profiles',
      note: 'Independent · Sourced · Configuration-aware',
    },
  },
  ar: {
    hero: {
      kicker: 'ذكاء العتاد · مصر',
      line1: 'الجهاز',
      line2: 'الدقيق.',
      sub: 'تكوينات لابتوبات ألعاب موثّقة لمصر: رقم القطعة، وتخطيط الذاكرة، ومنافذ التخزين، والمصدر خلف كل تفصيلة.',
      hint: 'تابع التمرير للاستكشاف',
      nodes: [
        'تكوين محدد',
        'تخطيط الذاكرة',
        'منافذ التخزين',
        'أثر المصدر',
        'درجة الثقة',
        'حدود الترقية',
        'العائلة مقابل الطراز',
      ],
      telemetry: [
        { label: 'ملفات مسجّلة', value: '٠٤', note: 'سجلات موثّقة' },
        { label: 'تكوينات مطابقة', value: '٠٣', note: 'رقم قطعة لكل منها' },
        { label: 'الأسعار', value: 'لا شيء', note: 'مستبعدة عن قصد' },
      ],
    },
    question: {
      kicker: '٠١ / السؤال',
      aside: 'لا شيء يقتصر على المواصفات',
      display: 'اسم العائلة ليس',
      accent: 'تكوينًا.',
      body: 'قد يتشارك جهازان نفس اسم العائلة ويخفيان عتادًا مختلفًا تمامًا. يتبع أبجراد أطلس التكوين الدقيق بدلًا من ذلك: رقم القطعة، وتخطيط الذاكرة، ومنافذ التخزين، والمصدر خلف كل معلومة.',
      link: 'ابدأ من الأدلة',
      railLeft: 'المواصفات نقطة بداية',
      railRight: 'درجات الثقة تشرح السياق',
    },
    desk: {
      kicker: '٠٢ / مكتب البحث',
      aside: 'لا محتوى ترويجي',
      display: 'ابدأ من',
      accent: 'جهاز محدد.',
      link: 'كل ملفات اللابتوبات',
      label: 'ثلاثة سجلات من المكتب',
    },
    method: {
      kicker: '٠٣ / كيف نقرأ العتاد',
      aside: 'لا محتوى ترويجي',
      display: 'كل معلومة',
      accent: 'لها حاشية.',
      body: 'المواصفة نافعة فقط حين تعرف أي تكوين تصف، ومن أين جاءت المعلومات.',
      principles: [
        {
          title: 'حدّد التكوين الدقيق',
          body: 'دليل الموديل المحدد يُوسم كتكوين محدد، ومعلومات مستوى العائلة تبقى موسومة كمرجع عائلي.',
        },
        {
          title: 'اقرأ حدود الترقية',
          body: 'منافذ الذاكرة والتخزين موثّقة كما هي، والتفاصيل الناقصة تبقى ناقصة فلا تُملأ الفجوات بتخمين.',
        },
        {
          title: 'أحضر سياقك الشرائي',
          body: 'الأسعار والتوافر يتغيران، فقارن تقديراتك التي تدخلها بحقائق العتاد الموثّقة لا ببيانات سوقية مفترضة.',
        },
      ],
    },
    hardware: {
      kicker: '٠٤ / البنية',
      aside: 'منظور انفجاري تصوري',
    },
    systems: {
      kicker: '٠٥ / الأنظمة',
      aside: 'قابلة للفحص لا مفترضة',
      display: 'بنية',
      accent: 'ذكية.',
      body: 'تُقرأ كل السجلات وفق الأنظمة الثمانية نفسها. اختر نظامًا لترى ما وثّقه الدليل الميداني عنه بالضبط.',
      nodes: [
        { key: 'processor', label: 'المعالج', body: 'رقم القطعة الدقيق خلف الأنوية، والمكان الذي تأكيد التكوين فيه.' },
        { key: 'display', label: 'الشاشة', body: 'حجم اللوحة ودقتها كما وردت. لا يُدّعى السطوع لأنه لم يُقَس.' },
        { key: 'memory', label: 'الذاكرة', body: 'نوع الوحدة وسرعتها والتخطيط الفعلي، بما في ذلك عدد المنافذ المشغولة.' },
        { key: 'storage', label: 'التخزين', body: 'السعة كما وردت، وهل عدد المنافذ موثّق أم ما زال مجهولًا.' },
        { key: 'cooling', label: 'التبريد', body: 'يُذكر تصميم التبريد فقط حيث ينص السجل عليه، ولا يُفترض الهدوء أبدًا.' },
        { key: 'wireless', label: 'الاتصال اللاسلكي', body: 'جيل حزمة الاتصال اللاسلكي كما هو موثّق لا مستنتج من سنة الطراز.' },
        { key: 'audio', label: 'الصوت', body: 'إعداد السماعات والميكروفون حيث يوثّقه المصدر، ويُعلَّم مجهولًا حيث لا يوثّقه.' },
        { key: 'security', label: 'الأمان', body: 'ميزات الأمان التي يسمّيها السجل فعلًا، دون أي ادعاءات غير مُتحقَّق منها.' },
      ],
    },
    next: {
      kicker: '٠٦ / الخطوة التالية',
      aside: 'أدوات لقرار أوضح',
      display: 'طريقتان',
      accent: 'إلى الأمام.',
      cards: [
        {
          kicker: 'قارن',
          title: 'ضع التفاصيل جنبًا إلى جنب.',
          body: 'قارن حتى ثلاثة ملفات بحثية على الصفوف المهمة.',
          cta: 'افتح المقارنة',
          to: '/compare',
        },
        {
          kicker: 'ترقية / استبدال',
          title: 'أدخل الأرقام التي تعرفها فعلًا.',
          body: 'أدخل تقديراتك وقارن بين الترقية وشراء بديل.',
          cta: 'افتح الحاسبة',
          to: '/upgrade',
        },
      ],
    },
    stories: {
      kicker: '٠٧ / ملاحظات ميدانية',
      aside: 'اقرأ قبل أن تقرر',
      display: 'مصمَّم من أجل',
      accent: 'زخم الإنسان.',
      stories: [
        {
          label: 'الاستوديو المحمول',
          title: 'حقيبة واحدة، جهاز واحد، أربع ساعات تصيير.',
          caption: 'محطة عمل يمكنك حملها.',
        },
        {
          label: 'ابنِ في أي مكان',
          title: 'البناء الذي ينتهي في القطار.',
          caption: 'الحوسبة تتبع الإنسان.',
        },
        {
          label: 'تركيز هادئ',
          title: 'حين تكون المروحة هي أعلى صوت في الغرفة.',
          caption: 'حرارة تسمعها.',
        },
      ],
    },
    cta: {
      display: 'ادخل',
      accent: 'المكتبة.',
      body: 'ستة تكوينات في مكان واحد صادق لقراءتها. لا أسعار، ولا ادعاءات توافر، ولا مواصفات مفترضة.',
      cta: 'تصفّح الملفات',
      note: 'مستقل · موثّق · واعٍ بالتكوين',
    },
  },
} as const;

export type CinematicCopy = (typeof cinematic)['en'];

export function cinematicCopy(locale: Locale): CinematicCopy {
  return cinematic[locale] as unknown as CinematicCopy;
}
