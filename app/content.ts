/**
 * EDITABLE WEDDING CONTENT
 * Update names, times, contact details, bank information, and bilingual copy here.
 */
export type Language = 'es' | 'en';

export const wedding = {
  names: {
    first: 'Inés Camara',
    second: 'Guillermo Martinez',
    short: 'Inés & Guille',
  },
  dateISO: '2026-09-26',
  venue: 'Finca El Venero',
  address: 'C. el Venero, s/n, 05100 Navaluenga, Ávila',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Finca+El+Venero%2C+Calle+el+Venero+s%2Fn%2C+05100+Navaluenga%2C+Avila',
  venueUrl: 'https://fincaelvenero.com/',
  pinterestUrl: 'https://pin.it/uHrJXg56k',
  bank: {
    holder: 'Guillermo Martinez Fernandez',
    iban: 'ES60 1465 0100 91 1775535838',
  },
  contact: {
    names: 'Inés & Guille',
    detail: 'Teléfonos por confirmar · Phone numbers to be confirmed',
  },
  content: {
    es: {
      languageName: 'Español',
      nav: {
        label: 'Navegación principal',
        place: 'El lugar',
        agenda: 'Agenda',
        info: 'Información',
        gift: 'Regalo',
        language: 'Seleccionar idioma',
      },
      hero: {
        eyebrow: 'Nos casamos',
        connector: 'y',
        date: '26 · 09 · 2026',
        dateLong: 'Sábado, 26 de septiembre de 2026',
        location: 'Navaluenga · Ávila',
        scroll: 'Descubre los detalles',
      },
      place: {
        label: '01 · El lugar',
        title: 'Un fin de semana entre naturaleza y amigos.',
        description:
          'Finca El Venero nos reúne en un entorno tranquilo junto al río Alberche, a pocos minutos del centro de Navaluenga. La finca cuenta con tres casas rurales y amplios espacios para celebrar juntos.',
        addressLabel: 'Dirección',
        maps: 'Abrir en Google Maps',
        venueWeb: 'Web de la finca',
      },
      arrival: {
        label: '02 · Cómo llegar',
        title: 'El camino hasta Navaluenga.',
        intro:
          'La finca está dentro del pueblo, cerca del puente románico. Recomendamos abrir la ruta en Maps antes de salir.',
        routes: [
          {
            title: 'Desde Madrid',
            text: 'Toma la M-501 hacia San Martín de Valdeiglesias, continúa por la N-403 dirección Ávila y toma el desvío AV-902 hacia Navaluenga.',
          },
          {
            title: 'Últimos metros',
            text: 'En el GPS busca “Finca El Venero” o C. el Venero, s/n. Evita seleccionar Venero Claro, que está al otro lado del pueblo.',
          },
        ],
        parkingTitle: 'Aparcamiento',
        parkingText: 'Hay aparcamiento gratuito dentro de la finca.',
        maps: 'Iniciar ruta',
      },
      agenda: {
        label: '03 · Agenda',
        title: 'Dos días para celebrar.',
        days: [
          {
            day: 'Viernes',
            date: '25 septiembre',
            events: [
              {
                time: '19:00',
                title: 'Preboda',
                description: 'Cena informal y unas copas para empezar el fin de semana juntos.',
              },
            ],
          },
          {
            day: 'Sábado',
            date: '26 septiembre',
            events: [
              {
                time: '14:30',
                title: 'Ceremonia',
                description: 'Nos encontramos en la finca para el comienzo de la boda.',
              },
              {
                time: 'Después',
                title: 'Celebración',
                description: 'Cóctel, comida, brindis y baile. El resto del día es para disfrutar.',
              },
            ],
          },
        ],
      },
      dress: {
        label: '04 · Dress code',
        title: 'Elegantes, cómodos y sin rigidez.',
        description:
          'Queremos que vengáis guapos, cómodos y sintiéndoos vosotros mismos: prendas con movimiento, tejidos ligeros y un punto personal. El estilo es arreglado, pero relajado y sin formalidades.',
        notes: [
          'Ellas: vestidos fluidos, monos o conjuntos con pantalón. Los colores, estampados y accesorios con personalidad son bienvenidos.',
          'Ellos: camisa de cuello abierto o polo de punto con pantalón de lino o chino. Prendas ligeras, tonos naturales y combinaciones sencillas; una chaqueta relajada solo si apetece.',
          'Elige un calzado cómodo con el que puedas disfrutar del jardín y bailar toda la noche. Trae una capa ligera para cuando refresque.',
          'Reservamos el blanco, el marfil y los total looks crema para la novia.',
        ],
        boardLabel: 'La inspiración',
        boardTitle: 'Campo mediterráneo, color y ganas de bailar.',
        boardText: 'Una guía de atmósfera, no un uniforme: looks naturales, con movimiento y cómodos para disfrutar del campo y bailar hasta tarde.',
        boardCta: 'Ver moodboard en Pinterest',
        palette: ['Oliva', 'Arena', 'Terracota', 'Rosa empolvado'],
      },
      info: {
        label: '05 · Información de interés',
        title: 'Todo lo práctico, en un vistazo.',
        cards: [
          {
            number: '01',
            title: 'Alojamiento',
            text: 'La finca tiene tres casas. Los invitados que duermen allí serán distribuidos entre ellas; compartiremos el reparto más adelante.',
          },
          {
            number: '02',
            title: 'Entrada y salida',
            text: 'Check-in el viernes desde las 15:00. El domingo tenemos salida tardía para despedirnos sin prisas.',
          },
          {
            number: '03',
            title: 'Desayuno',
            text: 'El desayuno del fin de semana está incluido para quienes se alojan en la finca.',
          },
          {
            number: '04',
            title: 'Piscina',
            text: 'Habrá piscina disponible. Si te quedas a dormir, no olvides traer bañador.',
          },
          {
            number: '05',
            title: 'Niños',
            text: 'Los niños son bienvenidos. Durante todo el fin de semana estarán bajo la responsabilidad de sus padres o tutores.',
          },
          {
            number: '06',
            title: 'Tiempo',
            text: 'Finales de septiembre suele traer días suaves y noches frescas. Consulta la previsión y trae una capa ligera.',
          },
          {
            number: '07',
            title: 'Transporte',
            text: 'No hay transporte organizado confirmado por ahora. Recomendamos coordinar coches y conductores con antelación.',
          },
          {
            number: '08',
            title: 'Contacto',
            text: 'Para cualquier duda, escríbenos a Inés o Guille. Añadiremos los teléfonos aquí cuando confirmemos el contacto final.',
          },
        ],
      },
      gift: {
        label: '06 · Regalo',
        title: 'Vuestra compañía es el mejor regalo.',
        message:
          'Lo más importante para nosotros es celebrar este día con vosotros. Si además queréis hacernos un regalo, podéis hacerlo en la siguiente cuenta.',
        holder: 'Titular',
        iban: 'IBAN',
        copy: 'Copiar número de cuenta',
        copied: 'Número de cuenta copiado',
      },
      footer: {
        closing: 'Nos vemos en Navaluenga',
        sourceNote: 'Hecho con cariño para nuestro fin de semana.',
      },
    },
    en: {
      languageName: 'English',
      nav: {
        label: 'Primary navigation',
        place: 'The place',
        agenda: 'Schedule',
        info: 'Information',
        gift: 'Gift',
        language: 'Select language',
      },
      hero: {
        eyebrow: 'We are getting married',
        connector: 'and',
        date: '26 · 09 · 2026',
        dateLong: 'Saturday, 26 September 2026',
        location: 'Navaluenga · Ávila, Spain',
        scroll: 'Discover the details',
      },
      place: {
        label: '01 · The place',
        title: 'A weekend surrounded by nature and friends.',
        description:
          'Finca El Venero brings us together in a peaceful setting by the Alberche River, just a few minutes from central Navaluenga. The estate has three country houses and generous spaces where we can celebrate together.',
        addressLabel: 'Address',
        maps: 'Open in Google Maps',
        venueWeb: 'Venue website',
      },
      arrival: {
        label: '02 · Getting there',
        title: 'The road to Navaluenga.',
        intro:
          'The estate is within the village, near the Romanesque bridge. We recommend opening the route in Maps before you set off.',
        routes: [
          {
            title: 'From Madrid',
            text: 'Take the M-501 towards San Martín de Valdeiglesias, continue on the N-403 towards Ávila, then take the AV-902 turn-off to Navaluenga.',
          },
          {
            title: 'The final stretch',
            text: 'Search for “Finca El Venero” or C. el Venero, s/n in your GPS. Avoid choosing Venero Claro, which is on the other side of the village.',
          },
        ],
        parkingTitle: 'Parking',
        parkingText: 'Free parking is available inside the estate.',
        maps: 'Start route',
      },
      agenda: {
        label: '03 · Schedule',
        title: 'Two days to celebrate.',
        days: [
          {
            day: 'Friday',
            date: '25 September',
            events: [
              {
                time: '19:00',
                title: 'Pre-wedding gathering',
                description: 'An informal dinner and drinks to begin the weekend together.',
              },
            ],
          },
          {
            day: 'Saturday',
            date: '26 September',
            events: [
              {
                time: '14:30',
                title: 'Ceremony',
                description: 'Meet us at the estate for the start of the wedding.',
              },
              {
                time: 'Afterwards',
                title: 'Celebration',
                description: 'Cocktails, lunch, toasts and dancing. The rest of the day is ours to enjoy.',
              },
            ],
          },
        ],
      },
      dress: {
        label: '04 · Dress code',
        title: 'Elegant, comfortable and never stiff.',
        description:
          'Come looking great, feeling comfortable and still like yourself: fluid silhouettes, light fabrics and a personal touch. The style is polished, relaxed and free from formality.',
        notes: [
          'For women: fluid dresses, jumpsuits or trouser separates. Colour, prints and expressive accessories are very welcome.',
          'For men: an open-collar shirt or knitted polo with linen trousers or chinos. Keep it light, simple and naturally toned; add a relaxed jacket only if you feel like it.',
          'Choose one comfortable pair of shoes that will take you from the garden to the dance floor. Bring a light layer for when it gets cooler.',
          'Please leave white, ivory and head-to-toe cream looks for the bride.',
        ],
        boardLabel: 'The inspiration',
        boardTitle: 'Mediterranean countryside, colour and dancing.',
        boardText: 'A guide to the atmosphere, not a uniform: natural looks with movement, made for enjoying the countryside and dancing late into the night.',
        boardCta: 'View moodboard on Pinterest',
        palette: ['Olive', 'Sand', 'Terracotta', 'Dusty pink'],
      },
      info: {
        label: '05 · Useful information',
        title: 'Everything practical, at a glance.',
        cards: [
          {
            number: '01',
            title: 'Accommodation',
            text: 'The estate has three houses. Overnight guests will be allocated between them; we will share the room plan later.',
          },
          {
            number: '02',
            title: 'Check-in & check-out',
            text: 'Check-in is on Friday from 15:00. We have a late Sunday check-out, so there is no need to rush goodbye.',
          },
          {
            number: '03',
            title: 'Breakfast',
            text: 'Weekend breakfast is included for everyone staying at the estate.',
          },
          {
            number: '04',
            title: 'Swimming pool',
            text: 'The pool will be available. If you are staying overnight, remember to bring swimwear.',
          },
          {
            number: '05',
            title: 'Children',
            text: 'Children are very welcome. Throughout the weekend they remain under the responsibility of their parents or guardians.',
          },
          {
            number: '06',
            title: 'Weather',
            text: 'Late September usually brings mild days and cooler evenings. Check the forecast and bring a light layer.',
          },
          {
            number: '07',
            title: 'Transport',
            text: 'No organised transport is confirmed yet. We recommend arranging cars and designated drivers in advance.',
          },
          {
            number: '08',
            title: 'Contact',
            text: 'If you have any questions, message Inés or Guille. We will add phone numbers here once the final contact details are confirmed.',
          },
        ],
      },
      gift: {
        label: '06 · Gift',
        title: 'Your company is the best gift.',
        message:
          'What matters most to us is celebrating this day with you. If you would also like to give us a gift, you may use the following account.',
        holder: 'Account holder',
        iban: 'IBAN',
        copy: 'Copy account number',
        copied: 'Account number copied',
      },
      footer: {
        closing: 'See you in Navaluenga',
        sourceNote: 'Made with love for our weekend together.',
      },
    },
  },
} as const;
