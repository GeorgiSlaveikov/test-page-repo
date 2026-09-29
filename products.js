/* EDIT YOUR CATALOG HERE. No build tools needed. See README.md for examples. */
window.STUDIO = {
  // Replace empty strings with real contact details to show the links.
  email: '',
  instagram: '', // Full URL, e.g. https://www.instagram.com/yourname/
  tiktok: '', // Full URL, e.g. https://www.tiktok.com/@yourname
  products: [
    { id: 'bloom', name: 'The Bloom lamp', category: 'Lamps', label: 'A softer kind of glow.', image: 'images/lamp.svg', alt: 'Illustrated sage green mushroom lamp with a pleated shade', badge: 'STUDIO FAVORITE', description: 'A sculptural little companion for your bedside or favorite reading corner. A pleated shade and a simple silhouette bring a soft, playful touch to your space.', details: ['Concept shown: sage green', 'Ask about available colors', 'Lighting specifications confirmed on enquiry'] },
    { id: 'garden', name: 'Garden party cutters', category: 'Cookie cutters', label: 'A little joy in every batch.', image: 'images/cutters.svg', alt: 'Illustrated flower, heart, and arch cookie cutter shapes in pastel colors', badge: '', description: 'Flower shapes, soft arches, and sweet little hearts for your next baking idea. This playful set is a starting point for a celebration with personality.', details: ['Example collection: three playful shapes', 'Custom shapes and sizes can be discussed', 'Ask about material suitability and care before food use'] },
    { id: 'finish-line', name: 'The finish line', category: 'Medal hangers', label: 'Your effort deserves a place.', image: 'images/medals.svg', alt: 'Illustrated dark medal hanger with mountain detail and three hanging medals', badge: 'MAKE IT PERSONAL', description: 'A dedicated spot for the moments you worked for. A mountain-inspired display turns your collection of medals into an everyday reminder of how far you’ve come.', details: ['Concept shown: charcoal with mountain detail', 'Personalize a name or short phrase', 'Mounting details and capacity confirmed on enquiry'] },
    { id: 'ripple', name: 'The Ripple lamp', category: 'Lamps', label: 'Warm light. Quiet character.', image: 'images/ripple.svg', alt: 'Illustrated ivory sculptural lamp with a wavy silhouette', badge: '', description: 'Soft curves and a rippled surface give this lamp its quiet character. An understated accent for a desk, sideboard, or cozy nook.', details: ['Concept shown: warm ivory', 'Ask about dimensions and finish options', 'Lighting specifications confirmed on enquiry'] },
    { id: 'little-celebrations', name: 'Little celebrations', category: 'Cookie cutters', label: 'Made for your special moments.', image: 'images/custom-cutter.svg', alt: 'Illustrated terracotta star and personalized arch cutter', badge: 'MAKE IT PERSONAL', description: 'A birthday, a little milestone, or just a reason to bake. Explore personalized lettering and shapes designed around your celebration.', details: ['Personalized lettering concept', 'Share your occasion and preferred size', 'Ask about material suitability and care before food use'] },
    { id: 'your-pace', name: 'At your own pace', category: 'Medal hangers', label: 'Every little victory belongs.', image: 'images/runner.svg', alt: 'Illustrated sage medal display with a running track motif and two medals', badge: '', description: 'Big milestones and first finishes alike deserve to be remembered. A simple, graphic medal display with room for a personal touch.', details: ['Concept shown: muted sage', 'Discuss your own wording or motif', 'Mounting details and capacity confirmed on enquiry'] }
  ]
};

// Bulgarian product copy. Keep the same id as the corresponding product above.
// Brand/model names such as Bloom and Ripple intentionally stay unchanged.
window.STUDIO.productTranslations = {
  bg: {
    bloom: {
      name: 'Лампа Bloom', label: 'По-мека светлина. Повече уют.',
      alt: 'Илюстрация на зелена настолна лампа с плисиран абажур във формата на гъба',
      description: 'Малък скулптурен акцент за нощното шкафче или любимия кът за четене. Плисираният абажур и изчистеният силует внасят мекота и игрив характер в дома.',
      details: ['Показан цвят: салвиево зелено', 'Попитайте за наличните цветове', 'Техническите характеристики се уточняват при запитване']
    },
    garden: {
      name: 'Формички „Цветна градина“', label: 'Малко радост във всяка партида.',
      alt: 'Илюстрация на формички за сладки — цвете, сърце и арка в пастелни цветове',
      description: 'Цветя, нежни арки и малки сърца за следващото ви сладко вдъхновение. Закачлив комплект, с който всеки празник придобива собствен характер.',
      details: ['Примерен комплект с три форми', 'Възможност за обсъждане на други форми и размери', 'Преди употреба с храна попитайте за подходящите материали и поддръжка']
    },
    'finish-line': {
      name: 'Закачалка „Финалната линия“', label: 'Усилията ви заслужават свое място.',
      alt: 'Илюстрация на тъмна закачалка с планински мотив и три медала',
      description: 'Специално място за моментите, за които сте положили усилия. Закачалката с планински мотив превръща медалите в ежедневно напомняне колко далеч сте стигнали.',
      details: ['Показан вариант: графитено сиво с планински мотив', 'Добавете име или кратък надпис', 'Монтажът и допустимото натоварване се уточняват при запитване']
    },
    ripple: {
      name: 'Лампа Ripple', label: 'Топла светлина. Ненатрапчив чар.',
      alt: 'Илюстрация на кремава настолна лампа с вълнообразен силует',
      description: 'Меки извивки и релефна повърхност придават на тази лампа ненатрапчив характер. Деликатен акцент за бюро, скрин или уютно кътче.',
      details: ['Показан цвят: топла слонова кост', 'Попитайте за размери и варианти на завършека', 'Техническите характеристики се уточняват при запитване']
    },
    'little-celebrations': {
      name: 'Формички „Малки празници“', label: 'За вашите специални моменти.',
      alt: 'Илюстрация на персонализирана формичка с надпис и формичка звезда',
      description: 'Рожден ден, малка победа или просто повод да изпечете нещо вкусно. Открийте форми и надписи, създадени специално за вашия празник.',
      details: ['Пример за персонализиран надпис', 'Споделете повода и желания размер', 'Преди употреба с храна попитайте за подходящите материали и поддръжка']
    },
    'your-pace': {
      name: 'Закачалка „В свое темпо“', label: 'Всяка малка победа има значение.',
      alt: 'Илюстрация на зелена закачалка с мотив на лекоатлетическа писта и два медала',
      description: 'Големите постижения и първите финали заслужават да бъдат запомнени. Изчистена закачалка за медали с графичен мотив и място за личен детайл.',
      details: ['Показан цвят: приглушено зелено', 'Обсъдете собствен надпис или мотив', 'Монтажът и допустимото натоварване се уточняват при запитване']
    }
  }
};
