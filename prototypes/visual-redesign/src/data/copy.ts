export type Locale = 'en' | 'ar';

const en = {
    localeName: 'العربية',
    localeSwitchLabel: 'Switch language',
    skipToMain: 'Skip to main content',
    nav: {
      home: 'FIELD GUIDE',
      laptops: 'LAPTOPS',
      gaming: 'GAMING',
      compare: 'COMPARE',
      upgrade: 'UPGRADE / REPLACE',
      ariaLabel: 'Main navigation',
    },
    availability: 'EGYPT · HARDWARE INTELLIGENCE',
    openMenu: 'Open navigation',
    closeMenu: 'Close navigation',
    footerBrand: 'UPGRADEATLAS · INDEPENDENT FIELD GUIDE',
    footerNote: 'Research profiles, not click offsets',
    footerLink: 'BROWSE THE LIBRARY',
    home: {
      eyebrow: 'Hardware intelligence · Egypt',
      titleLines: ['Find the right', 'laptop.'],
      titleAccentLine: 'Upgrade',
      titleAccent: 'smarter.',
      description: ['Verified hardware.', 'Real upgrade paths.', 'Better buying decisions.'],
      primaryCta: 'EXPLORE LAPTOPS',
      secondaryCta: 'HOW IT WORKS',
      footnote: 'Built for the Egyptian gamer',
      bottomLeft: 'INDEPENDENT RESEARCH · LOCAL',
      bottomRight: 'DECISIONS, DOWN TO THE LAST SLOT',
      sections: [
        {
          index: '01',
          kicker: 'THE QUESTION',
          aside: 'NOTHING IS ONLY THE SPECIFICATIONS',
          heading: ['THE MODEL NAME', 'IS **NOT** THE WHOLE STORY.'],
          body:
            'Two laptops can share a family name and hide very different hardware underneath. UpgradeAtlas follows the exact configuration: the part number, the memory layout, the storage slots, and the source behind every detail.',
          link: 'START WITH THE EVIDENCE',
          railLeft: 'SPECIFICATION IS A STARTING POINT',
          railRight: 'CONFIDENCE SCORES FOR CONTEXT',
        },
        {
          index: '02',
          kicker: 'THE RESEARCH DESK',
          aside: 'NO RETAILER PITCH',
          heading: ['Start with a', '**specific machine.**'],
          link: 'ALL LAPTOP PROFILES',
          sectionLabel: 'NO. 2 / FROM THE DESK',
        },
        {
          index: '03',
          kicker: 'HOW WE READ THE HARDWARE',
          aside: 'NO RETAILER PITCH',
          heading: ['Every claim', 'has a **footnote.**'],
          body:
            'A specification is useful only when you know which configuration it describes, and where the information came from.',
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
        {
          index: '04',
          kicker: 'THE NEXT MOVE',
          aside: 'TOOLS FOR A CLEARER DECISION',
          cards: [
            {
              kicker: '04 / COMPARE',
              title: 'Put the details side by side.',
              body: 'Compare up to three researched profiles on the details that matter.',
              cta: 'OPEN COMPARISON',
              to: '/compare',
            },
            {
              kicker: '04 / UPGRADE / REPLACE',
              title: 'Run the numbers you actually know.',
              body: 'Enter your own estimates to compare an upgrade with a replacement purchase.',
              cta: 'OPEN CALCULATOR',
              to: '/upgrade',
            },
          ],
        },
      ],
      codaTitle: 'THE EVIDENCE IS THE PRODUCT.',
      codaNote: 'Independent · sourced · configuration-aware',
      codaCta: 'ENTER THE FIELD GUIDE',
    },
    profile: {
      index: 'UPGRADEATLAS FIELD GUIDE',
      notFiled: 'The research library',
      backToLibrary: 'BACK TO THE RESEARCH LIBRARY',
      sectionSpecs: '01',
      specsLabel: 'The exact configuration',
      confidenceLabel: 'EVIDENCE',
      footRight: 'SOURCE: RESEARCH RECORD',
      evidenceTitle: 'How this record was read',
      evidenceExact:
        'This profile is backed by an exact configuration: one part number, one set of components. Read the rows below as the machine itself.',
      evidenceFamily:
        'This profile is backed by a model family, not one exact configuration. Some rows are documented as varying, and they stay that way here.',
      noPrices: 'NO PRICES · NO STOCK CLAIMS',
      processor: 'PROCESSOR',
      graphics: 'GRAPHICS',
      memory: 'MEMORY',
      storage: 'STORAGE',
      partNumber: 'PART NUMBER',
      sku: 'SKU',
      openComparison: 'OPEN THE COMPARISON',
    },
    compare: {
      index: '02  /  UpgradeAtlas field guide',
      eyebrow: 'THE COMPARISON',
      heading: ['Put the details', 'side by side.'],
      deck:
        'Compare up to three researched profiles on the rows that matter. A row that says the configuration varies stays a row that varies.',
      profiles: 'PROFILES SELECTED',
      limit: 'MAXIMUM THREE PROFILES',
      processor: 'PROCESSOR',
      graphics: 'GRAPHICS',
      memory: 'MEMORY',
      storage: 'STORAGE',
      partNumber: 'PART NUMBER',
      confidence: 'EVIDENCE',
      remove: 'Remove this profile from the comparison',
      clear: 'CLEAR SELECTION',
      disclaimer: 'Research profiles, not live listings. No prices, no stock claims.',
      caution:
        'Two profiles from the same family can still differ in the slots you care about. A matching name is not a matching machine.',
      emptyTitle: 'Nothing selected yet.',
      emptyBody: 'Pick up to three profiles in the research library, then come back to line them up.',
      emptyCta: 'OPEN THE RESEARCH LIBRARY',
    },
    gaming: {
      index: '03  /  UpgradeAtlas field guide',
      eyebrow: 'THE GRAPHICS DESK',
      heading: ['Read the graphics', 'before the badge.'],
      deck:
        'The graphics part number decides more than the sticker suggests. Here is what each recorded GPU actually is.',
      contextLabel: 'READ THIS FIRST',
      context:
        'A laptop GPU shares system memory with the rest of the machine, so the number on the box is a ceiling, not a promise. Nothing here is a benchmark.',
      gpuCount: 'GRAPHICS RECORDS',
      gpuNote: 'FROM THE SAME RESEARCH RECORDS',
      genericNote: 'No graphics note has been recorded for this configuration yet.',
      memoryLabel: 'MEMORY',
      storageLabel: 'STORAGE',
      partLabel: 'PART',
      notes: {
        'NVIDIA GeForce RTX 2050':
          'Entry laptop GPU. Shared memory, so sustained load throttles.',
        'NVIDIA GeForce RTX 4050 Laptop GPU':
          'Mid-range laptop GPU. Frame generation is not available on this tier.',
        'NVIDIA GeForce RTX 4050':
          'Mid-range laptop GPU. Frame generation is not available on this tier.',
        'NVIDIA GeForce RTX 4060':
          'The discrete GPU in this configuration, with a separate 8 GB of VRAM.',
      },
      openProfile: 'OPEN THE PROFILE',
      disclaimer:
        'Graphics notes describe the part, not the machine around it. Cooling, power limits and memory configuration change real results, and none of those are measured here.',
    },
    upgrade: {
      index: '04  /  UpgradeAtlas field guide',
      eyebrow: 'THE COST WORKBENCH',
      heading: ['Run the numbers', 'you actually know.'],
      deck:
        'Enter your own estimates and compare an upgrade against a replacement. No invented prices, no market data, no financing.',
      stepOne: 'STEP 01 / YOUR ESTIMATES',
      stepTwo: 'STEP 02 / THE COMPARISON',
      formTitle: 'What the upgrade would cost',
      fieldMemory: 'Memory upgrade',
      fieldStorage: 'Storage upgrade',
      fieldInstallation: 'Installation',
      fieldReplacement: 'Replacement laptop',
      hintMemory: 'Enter 0 if no memory upgrade is planned.',
      hintStorage: 'Enter 0 if you are keeping your storage.',
      hintInstallation: 'The installation cost you expect to pay.',
      hintReplacement: 'Your own total for the alternative machine.',
      calculate: 'CALCULATE THE COMPARISON',
      clear: 'CLEAR THE FIELDS',
      upgradeTotal: 'UPGRADE TOTAL',
      replacementTotal: 'REPLACEMENT TOTAL',
      verdict: 'ON THE NUMBERS YOU ENTERED',
      equal: 'Both cost the same.',
      upgradeLower: 'Upgrading costs less.',
      replacementLower: 'Replacing costs less.',
      note: 'A lower entered cost is not a verdict on which machine is better. Nothing here checks compatibility or predicts performance.',
      prompt: 'Nothing calculated yet.',
      promptBody: 'Enter the four figures on the left, then calculate. A cost of zero is a valid answer.',
      noPrices: 'NO PRICES · NO STOCK CLAIMS',
      invalid: 'Every field needs a number. Zero is allowed; a missing figure is not.',
      footLeft: 'YOUR FIGURES ONLY',
      footRight: 'NO MARKET DATA',
    },
    catalog: {
      index: '01  /  UpgradeAtlas field guide',
      eyebrow: 'The research library',
      heading: ['A machine is more', 'than a family name.'],
      deck:
        'Search sourced laptop profiles by model, part number, processor, or graphics. Read the configuration caveat before treating a family reference as an exact match.',
      searchLabel: 'Search laptop profiles',
      searchPlaceholder: 'Model, part number, processor or GPU',
      brand: 'Brand',
      confidence: 'Confidence',
      reset: 'RESET',
      profilesCount: 'PROFILES',
      noPrices: 'NO PRICES · NO STOCK CLAIMS',
      processor: 'PROCESSOR',
      graphics: 'GRAPHICS',
      memory: 'MEMORY',
      storage: 'STORAGE',
      readProfile: 'READ PROFILE',
      added: 'ADDED',
      compare: 'COMPARE',
      disclaimerLabel: 'RESEARCH NOTE',
      disclaimer:
        'Research profiles, not live Egyptian listings. Prices and stock are intentionally omitted; regional specifications can differ.',
      disclaimerLink: 'COMPARE SELECTED PROFILES',
      noMatch: 'No profiles match those filters.',
      noMatchHint: 'Try a different model code, or reset the filters.',
      exact: 'Exact configuration',
      family: 'Model family',
    },
} as const;

const ar = {
  localeName: 'English',
    localeSwitchLabel: 'تغيير اللغة',
    skipToMain: 'تخطَّ إلى المحتوى الرئيسي',
    nav: {
      home: 'الدليل الميداني',
      laptops: 'اللابتوبات',
      gaming: 'الألعاب',
      compare: 'المقارنة',
      upgrade: 'ترقية / استبدال',
      ariaLabel: 'التنقل الرئيسي',
    },
    availability: 'مصر · ذكاء العتاد',
    openMenu: 'افتح القائمة',
    closeMenu: 'أغلق القائمة',
    footerBrand: 'UPGRADEATLAS · دليل مستقل',
    footerNote: 'ملفات بحثية، لا عروض أسعار',
    footerLink: 'تصفّح المكتبة',
    home: {
      eyebrow: 'ذكاء العتاد · مصر',
      titleLines: ['اختار اللابتوب', 'الصح.'],
      titleAccentLine: 'وطوّر',
      titleAccent: 'بذكاء.',
      description: ['عتاد موثّق.', 'طرق ترقية حقيقية.', 'قرارات شراء أفضل.'],
      primaryCta: 'استكشف اللابتوبات',
      secondaryCta: 'كيف نعمل',
      footnote: 'مصمم للاعب المصري',
      bottomLeft: 'بحث مستقل · محلي',
      bottomRight: 'القرارات، حتى آخر تفصيلة',
      sections: [
        {
          index: '01',
          kicker: 'السؤال',
          aside: 'المواصفات وحدها لا تكفي',
          heading: ['اسم الموديل', 'ليس القصة كلها.'],
          body:
            'قد يتشارك لابتوبان نفس اسم العائلة ويخفيان عتادًا مختلفًا تمامًا. يتبع UpgradeAtlas التكوين الدقيق: رقم القطعة، وتخطيط الذاكرة، ومنافذ التخزين، والمصدر خلف كل تفصيلة.',
          link: 'ابدأ من الدليل',
          railLeft: 'المواصفات نقطة بداية',
          railRight: 'درجات الثقة تشرح السياق',
        },
        {
          index: '02',
          kicker: 'مكتب البحث',
          aside: 'لا محتوى ترويجي',
          heading: ['ابدأ من', 'جهاز محدد.'],
          link: 'كل ملفات اللابتوبات',
          sectionLabel: 'رقم ٢ / من المكتب',
        },
        {
          index: '03',
          kicker: 'كيف نقرأ العتاد',
          aside: 'لا محتوى ترويجي',
          heading: ['كل معلومة', 'لها حاشية.'],
          body:
            'المواصفة نافعة فقط حين تعرف أي تكوين تصف، ومن أين جاءت المعلومات.',
          principles: [
            {
              title: 'حدّد التكوين الدقيق',
              body: 'دليل الموديل المحدد يُوسم كتكوين محدد. ومعلومات مستوى العائلة تبقى موسومة كمرجع عائلي.',
            },
            {
              title: 'اقرأ حدود الترقية',
              body: 'منافذ الذاكرة والتخزين موثّقة كما هي. التفاصيل الناقصة تبقى ناقصة، فلا تملأ الفجوات بتخمين.',
            },
            {
              title: 'أحضر سياقك الشرائي',
              body: 'الأسعار والتوافر يتغيران. قارن تقديراتك التي تدخلها بحقائق العتاد الموثّقة، لا ببيانات سوقية مفترضة.',
            },
          ],
        },
        {
          index: '04',
          kicker: 'الخطوة التالية',
          aside: 'أدوات لقرار أوضح',
          cards: [
            {
              kicker: 'قارن',
              title: 'ضع التفاصيل جنبًا إلى جنب.',
              body: 'قارن حتى ثلاثة ملفات بحثية على التفاصيل المهمة.',
              cta: 'افتح المقارنة',
              to: '/compare',
            },
            {
              kicker: 'ترقية / استبدال',
              title: 'أدخل الأرقام التي تعرفها.',
              body: 'أدخل تقديراتك وقارن بين الترقية وشراء بديل.',
              cta: 'افتح الحاسبة',
              to: '/upgrade',
            },
          ],
        },
      ],
      codaTitle: 'الدليل هو المنتج.',
      codaNote: 'مستقل · موثّق · واعٍ بالتكوين',
      codaCta: 'ادخل الدليل الميداني',
    },
    profile: {
      index: 'دليل أبجراد أطلس',
      notFiled: 'مكتبة البحث',
      backToLibrary: 'العودة إلى مكتبة البحث',
      sectionSpecs: '٠١',
      specsLabel: 'التكوين الدقيق',
      confidenceLabel: 'الدليل',
      footRight: 'المصدر: سجل بحثي',
      evidenceTitle: 'كيف قُرئ هذا السجل',
      evidenceExact:
        'هذا الملف مبني على تكوين محدد: رقم قطعة واحد ومجموعة مكوّنات واحدة. اقرأ الصفوف أدناه كوصف للجهاز نفسه.',
      evidenceFamily:
        'هذا الملف مبني على عائلة موديلات، لا على تكوين واحد. بعض الصفوف موثّقة كمتغيّرة، وتبقى كذلك هنا.',
      noPrices: 'لا أسعار · لا ادعاءات توافر',
      processor: 'المعالج',
      graphics: 'كرت الشاشة',
      memory: 'الذاكرة',
      storage: 'التخزين',
      partNumber: 'رقم القطعة',
      sku: 'SKU',
      openComparison: 'افتح المقارنة',
    },
    compare: {
      index: '٠٢  /  الدليل الميداني',
      eyebrow: 'المقارنة',
      heading: ['ضع التفاصيل', 'جنبًا إلى جنب.'],
      deck:
        'قارن حتى ثلاثة ملفات بحثية على الصفوف المهمة. وما يقول إن التكوين متغيّر يبقى متغيّرًا هنا.',
      profiles: 'ملفًا مختارًا',
      limit: 'الحد الأقصى ثلاثة ملفات',
      processor: 'المعالج',
      graphics: 'كرت الشاشة',
      memory: 'الذاكرة',
      storage: 'التخزين',
      partNumber: 'رقم القطعة',
      confidence: 'الدليل',
      remove: 'أزل هذا الملف من المقارنة',
      clear: 'مسح الاختيار',
      disclaimer: 'ملفات بحثية، لا قوائم بيع. لا أسعار ولا ادعاءات توافر.',
      caution:
        'ملفان من نفس العائلة قد يختلفان في المنافذ التي تهمك. تطابق الاسم ليس تطابق الجهاز.',
      emptyTitle: 'لم تختر شيئًا بعد.',
      emptyBody: 'اختر حتى ثلاثة ملفات في مكتبة البحث، ثم عد للمقارنة.',
      emptyCta: 'افتح مكتبة البحث',
    },
    gaming: {
      index: '٠٣  /  الدليل الميداني',
      eyebrow: 'مكتب كروت الشاشة',
      heading: ['اقرأ الكرت', 'قبل الملصق.'],
      deck:
        'رقم كرت الشاشة يحدد أكثر مما يوحي به الملصق. إليك ما هو عليه كل كرت مسجّل.',
      contextLabel: 'اقرأ هذا أولًا',
      context:
        'كرت الشاشة في اللابتوب يشارك ذاكرة النظام مع بقية الجهاز، فالرقم على العلبة سقف لا وعد. لا شيء هنا قياس أداء.',
      gpuCount: 'سجل كروت الشاشة',
      gpuNote: 'من سجلات البحث نفسها',
      genericNote: 'لم يُسجَّل بعد أي ملاحظة عن كرت الشاشة لهذا التكوين.',
      memoryLabel: 'الذاكرة',
      storageLabel: 'التخزين',
      partLabel: 'القطعة',
      notes: {
        'NVIDIA GeForce RTX 2050':
          'كرت شاشة بسيط. يشارك ذاكرة النظام، فالأداء المستمر يخفض تلقائيًا.',
        'NVIDIA GeForce RTX 4050 Laptop GPU':
          'كرت شاشة متوسط. توليد الإطارات غير متاح في هذه الفئة.',
        'NVIDIA GeForce RTX 4050':
          'كرت شاشة متوسط. توليد الإطارات غير متاح في هذه الفئة.',
        'NVIDIA GeForce RTX 4060':
          'كرت الشاشة المنفصل في هذا التكوين، بذاكرة ٨ جيجابايت مستقلة.',
      },
      openProfile: 'افتح الملف',
      disclaimer:
        'ملاحظات كرت الشاشة تصف القطعة لا الجهاز حولها. التبريد وحدود الطاقة وإعداد الذاكرة تغيّر النتائج الفعلية، ولا شيء من ذلك مقيس هنا.',
    },
    upgrade: {
      index: '٠٤  /  الدليل الميداني',
      eyebrow: 'مساحة مقارنة التكاليف',
      heading: ['أدخل الأرقام', 'التي تعرفها فعلًا.'],
      deck:
        'أدخل تقديراتك وقارن بين الترقية والاستبدال. بلا أسعار مفترضة، بلا بيانات سوق، بلا تمويل.',
      stepOne: 'خطوة ٠١ / تقديراتك',
      stepTwo: 'خطوة ٠٢ / المقارنة',
      formTitle: 'كم ستكلف الترقية',
      fieldMemory: 'ترقية الذاكرة',
      fieldStorage: 'ترقية التخزين',
      fieldInstallation: 'التركيب',
      fieldReplacement: 'اللابتوب البديل',
      hintMemory: 'اكتب 0 لو مش هتغيّر الرام.',
      hintStorage: 'اكتب 0 لو هتحتفظ بالتخزين الحالي.',
      hintInstallation: 'تكلفة التركيب اللي تتوقّع تدفعها.',
      hintReplacement: 'إجمالي تقديرك للجهاز البديل.',
      calculate: 'احسب المقارنة',
      clear: 'امسح الحقول',
      upgradeTotal: 'إجمالي الترقية',
      replacementTotal: 'إجمالي البديل',
      verdict: 'حسب الأرقام التي أدخلتها',
      equal: 'التكلفة متساوية.',
      upgradeLower: 'الترقية أقل تكلفة.',
      replacementLower: 'الاستبدال أقل تكلفة.',
      note: 'انخفاض التكلفة المدخلة ليس حكمًا على أيهما أفضل. لا شيء هنا يفحص التوافق ولا يتوقّع الأداء.',
      prompt: 'لم يُحسب شيء بعد.',
      promptBody: 'أدخل الأرقام الأربعة على اليسار ثم احسب. الصفر إجابة صحيحة.',
      noPrices: 'لا أسعار · لا ادعاءات توافر',
      invalid: 'كل خانة تحتاج رقمًا. الصفر مقبول، والرقم الناقص ليس كذلك.',
      footLeft: 'أرقامك فقط',
      footRight: 'لا بيانات سوق',
    },
    catalog: {
      index: '01  /  الدليل الميداني',
      eyebrow: 'مكتبة البحث',
      heading: ['الجهاز أكثر من', 'مجرد اسم عائلة.'],
      deck:
        'ابحث في ملفات اللابتوبات الموثّقة بالموديل أو رقم القطعة أو المعالج أو كرت الشاشة. اقرأ تحذير التكوين قبل اعتبار أي مرجع عائلي مطابقًا تمامًا.',
      searchLabel: 'ابحث في ملفات اللابتوبات',
      searchPlaceholder: 'الموديل، رقم القطعة، المعالج أو كرت الشاشة',
      brand: 'الماركة',
      confidence: 'مستوى الثقة',
      reset: 'إعادة ضبط',
      profilesCount: 'ملفًا بحثيًا',
      noPrices: 'لا أسعار · لا ادعاءات توافر',
      processor: 'المعالج',
      graphics: 'كرت الشاشة',
      memory: 'الذاكرة',
      storage: 'التخزين',
      readProfile: 'اقرأ الملف',
      added: 'مُضاف',
      compare: 'قارن',
      disclaimerLabel: 'ملاحظة بحث',
      disclaimer:
        'ملفات بحثية، لا قوائم بيع مصرية حالية. الأسعار والتوافر مستبعدة عن قصد؛ والمواصفات الإقليمية قد تختلف.',
      disclaimerLink: 'قارن الملفات المختارة',
      noMatch: 'لا توجد ملفات مطابقة لهذه الفلاتر.',
      noMatchHint: 'جرّب كود موديل آخر، أو أعد ضبط الفلاتر.',
      exact: 'تكوين محدد',
      family: 'عائلة موديلات',
    },
} as const;

/** The four home sections have deliberately different shapes; this names them. */
type HomeSection =
  | {
      index: string;
      kicker: string;
      aside: string;
      heading: readonly [string, string];
      body: string;
      link: string;
      railLeft: string;
      railRight: string;
    }
  | {
      index: string;
      kicker: string;
      aside: string;
      heading: readonly [string, string];
      link: string;
      sectionLabel: string;
    }
  | {
      index: string;
      kicker: string;
      aside: string;
      heading: readonly [string, string];
      body: string;
      principles: readonly { title: string; body: string }[];
    }
  | {
      index: string;
      kicker: string;
      aside: string;
      cards: readonly {
        kicker: string;
        title: string;
        body: string;
        cta: string;
        to: string;
      }[];
    };

type HomeSections = readonly [
  Extract<HomeSection, { railLeft: string }>,
  Extract<HomeSection, { sectionLabel: string }>,
  Extract<HomeSection, { principles: readonly { title: string; body: string }[] }>,
  Extract<HomeSection, { cards: readonly { kicker: string; title: string; body: string; cta: string; to: string }[] }>,
];

/** Widen the literal types so both locales share one shape. */
type Widen<T> = T extends string
  ? string
  : T extends readonly [infer A, infer B]
    ? readonly [Widen<A>, Widen<B>]
    : T extends readonly (infer U)[]
      ? readonly Widen<U>[]
      : T extends object
        ? { [K in keyof T]: Widen<T[K]> }
        : T;

export type LocaleCopy = Omit<Widen<typeof en>, 'home'> & {
  home: Omit<Widen<typeof en>['home'], 'sections'> & { sections: HomeSections };
};

export const copy: { en: LocaleCopy; ar: LocaleCopy } = { en, ar };

export function t(locale: Locale) {
  return copy[locale];
}
