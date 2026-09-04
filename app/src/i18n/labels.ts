import { msg } from './locales'

export const brands = {
  fields: {
    slug: {
      description: msg(
        'URL-friendly version of the brand name',
        'Versión del nombre de la marca apta para URLs'
      ),
      label: msg('Slug', 'Slug'),
    },
  },
  labels: {
    plural: msg('Brands', 'Marcas'),
    singular: msg('Brand', 'Marca'),
  },
}

export const carModels = {
  errors: {
    brandMissing: msg(
      'The selected brand does not exist',
      'La marca seleccionada no existe'
    ),
  },
  fields: {
    brand: {
      description: msg(
        'Brand this model belongs to',
        'Marca a la que pertenece el modelo'
      ),
    },
  },
  labels: {
    plural: msg('Car models', 'Modelos'),
    singular: msg('Car model', 'Modelo'),
  },
}

export const carVersions = {
  fields: {
    clave: {
      description: msg(
        'Vehicle key (unique identifier for the version)',
        'Clave vehicular (identificador único de la versión)'
      ),
      label: msg('Vehicle key', 'Clave vehicular'),
    },
    model: {
      description: msg(
        'Model this version belongs to',
        'Modelo al que pertenece esta versión'
      ),
    },
    years: {
      description: msg(
        'Years this version was sold',
        'Años en que se vendió esta versión'
      ),
      label: msg('Years', 'Años'),
    },
  },
  labels: {
    plural: msg('Car versions', 'Versiones'),
    singular: msg('Car version', 'Versión'),
  },
}

export const cars = {
  fields: {
    availableLoanTerms: {
      description: msg(
        'List of terms in months you offer (e.g. 6, 12, 24, 36, 48, 60)',
        'Lista de plazos en meses que ofreces (ej. 6, 12, 24, 36, 48, 60)'
      ),
      label: msg('Available terms (months)', 'Plazos disponibles (meses)'),
    },
    bodyAndCapacity: {
      label: msg('Body and capacity', 'Carrocería y capacidad'),
    },
    bodyStyle: {
      description: msg(
        'Body style (aligned with Facebook Marketplace)',
        'Tipo de carrocería (alineado con Facebook Marketplace)'
      ),
      label: msg('Body style', 'Tipo de carrocería'),
    },
    carHistory: {
      description: msg(
        'Vehicle warranty and inspection',
        'Garantía e inspección del vehículo'
      ),
      label: msg('Car history', 'Historial del auto'),
    },
    colors: {
      label: msg('Colors', 'Colores'),
    },
    conditioning: {
      description: msg(
        'Received reconditioning/detailing? (Yes/No)',
        '¿Recibió reacondicionamiento/detallado? (Sí/No)'
      ),
      label: msg('Reconditioning', 'Reacondicionamiento'),
    },
    cylinders: {
      label: msg('Cylinders', 'Cilindros'),
    },
    dealership: {
      description: msg(
        'Dealership where the car is. Its city decides which page the car is listed on and which map shows on the detail page, so it has to be right.',
        'Concesionario donde está el auto. Su ciudad decide en qué página se lista el auto y qué mapa se muestra en el detalle, así que tiene que estar bien.'
      ),
      label: msg('Dealership', 'Concesionario'),
    },
    defaultDownPaymentPercentage: {
      description: msg(
        'Default suggested down payment percentage',
        'Porcentaje de enganche sugerido por defecto'
      ),
      label: msg('Default down payment (%)', 'Enganche por defecto (%)'),
    },
    defaultLoanTerm: {
      description: msg(
        'Default suggested term in months (must be in the available list)',
        'Plazo sugerido por defecto en meses (debe estar en la lista disponible)'
      ),
      label: msg('Default term (months)', 'Plazo por defecto (meses)'),
    },
    doors: {
      description: msg('Number of doors (e.g. 4)', 'Número de puertas (ej. 4)'),
      label: msg('Doors', 'Puertas'),
    },
    duplicateKeys: {
      description: msg(
        'Includes duplicate keys? (Yes/No)',
        '¿Incluye llaves duplicadas? (Sí/No)'
      ),
      label: msg('Duplicate keys', 'Llaves duplicadas'),
    },
    engine: {
      description: msg(
        'Engine specification (e.g. L4 2.0t, V6 3.5L)',
        'Especificación del motor (ej. L4 2.0t, V6 3.5L)'
      ),
      label: msg('Engine', 'Motor'),
    },
    engineAndPerformance: {
      label: msg('Engine and performance', 'Motor y desempeño'),
    },
    exteriorColor: {
      description: msg(
        'Body color. Not on the list? Add it in the Colors collection.',
        'Color de la carrocería. ¿No está en la lista? Agrégalo en la colección Colores.'
      ),
      label: msg('Exterior color', 'Color exterior'),
    },
    exteriorImages: {
      description: msg(
        'Exterior photos of the vehicle (body, front, sides)',
        'Fotos exteriores del vehículo (carrocería, frente, costados)'
      ),
      label: msg('Exterior images', 'Imágenes exteriores'),
    },
    feature: {
      label: msg('Feature', 'Característica'),
      placeholder: msg(
        'Bluetooth, Backup camera, etc.',
        'Bluetooth, Cámara trasera, etc.'
      ),
    },
    featured: {
      label: msg('Featured', 'Destacado'),
    },
    featuredImage: {
      description: msg(
        'Image shown in the preview',
        'Imagen mostrada en la vista previa'
      ),
      label: msg('Featured image', 'Imagen destacada'),
    },
    features: {
      description: msg(
        'Equipment and special features of the vehicle',
        'Equipamiento y características especiales del vehículo'
      ),
      label: msg('Features', 'Características'),
    },
    financingOptions: {
      label: msg('Financing options', 'Opciones de financiamiento'),
    },
    fuelType: {
      description: msg('Fuel type', 'Tipo de combustible'),
      label: msg('Fuel type', 'Tipo de combustible'),
    },
    hasVAT: {
      description: msg(
        'Does the price include/invoice VAT? (shown as Yes/No)',
        '¿El precio incluye/factura IVA? (se muestra como Sí/No)'
      ),
      label: msg('VAT', 'IVA'),
    },
    horsepower: {
      description: msg('Horsepower (HP)', 'Caballos de fuerza (HP)'),
      label: msg('Horsepower', 'Caballos de fuerza'),
    },
    inspectionPoints: {
      description: msg(
        'Number of inspected points (e.g. 150 → "+150 points")',
        'Número de puntos inspeccionados (ej. 150 → "+150 puntos")'
      ),
      label: msg('Inspection points', 'Puntos de inspección'),
    },
    interestRate: {
      description: msg('Annual interest rate (%)', 'Tasa de interés anual (%)'),
      label: msg('Interest rate', 'Tasa de interés'),
    },
    interiorColor: {
      description: msg(
        'Upholstery color. Not on the list? Add it in the Colors collection.',
        'Color de la tapicería. ¿No está en la lista? Agrégalo en la colección Colores.'
      ),
      label: msg('Interior color', 'Color interior'),
    },
    interiorImages: {
      description: msg(
        'Interior photos of the vehicle (cabin, seats, dashboard)',
        'Fotos interiores del vehículo (cabina, asientos, tablero)'
      ),
      label: msg('Interior images', 'Imágenes interiores'),
    },
    location: {
      label: msg('Location', 'Ubicación'),
    },
    manuals: {
      description: msg(
        'Includes manuals? (Yes/No)',
        '¿Incluye manuales? (Sí/No)'
      ),
      label: msg('Manuals', 'Manuales'),
    },
    maxDownPaymentPercentage: {
      description: msg(
        'Maximum down payment percentage (e.g. 80%)',
        'Porcentaje máximo de enganche (ej. 80%)'
      ),
      label: msg('Maximum down payment (%)', 'Enganche máximo (%)'),
    },
    mileage: {
      description: msg(
        'Enter mileage in kilometers (e.g., 150000)',
        'Ingresa el kilometraje en kilómetros (ej., 150000)'
      ),
      label: msg('Mileage', 'Kilometraje'),
      placeholder: msg('e.g., 150000', 'ej., 150000'),
    },
    minDownPaymentPercentage: {
      description: msg(
        'Minimum down payment percentage (e.g. 20%)',
        'Porcentaje mínimo de enganche (ej. 20%)'
      ),
      label: msg('Minimum down payment (%)', 'Enganche mínimo (%)'),
    },
    months: {
      label: msg('Months', 'Meses'),
    },
    ownerHistory: {
      label: msg('Owner history', 'Historial de dueños'),
    },
    passengers: {
      label: msg('Passengers', 'Pasajeros'),
    },
    plates: {
      description: msg(
        'Includes license plates? (Yes/No)',
        '¿Incluye placas? (Sí/No)'
      ),
      label: msg('License plates', 'Placas'),
    },
    price: {
      description: msg(
        'Enter price in dollars (e.g., 25000)',
        'Ingresa el precio en dólares (ej., 25000)'
      ),
      label: msg('Price', 'Precio'),
      placeholder: msg('e.g., 25000', 'ej., 25000'),
    },
    showFinancing: {
      description: msg(
        'Turn it off for cash-only cars; hides the calculator on the vehicle detail page.',
        'Desactívalo para autos solo de contado; oculta la calculadora en la página de detalle del vehículo.'
      ),
      label: msg(
        'Show financing calculator',
        'Mostrar calculadora de financiamiento'
      ),
    },
    status: {
      description: msg(
        'Current availability status of the vehicle',
        'Estado actual de disponibilidad del vehículo'
      ),
      label: msg('Status', 'Estado'),
    },
    transmission: {
      label: msg('Transmission', 'Transmisión'),
    },
    usageAndCondition: {
      label: msg('Usage and condition', 'Uso y condición'),
    },
    vehicleCondition: {
      description: msg(
        'Overall vehicle condition (Facebook Marketplace)',
        'Condición general del vehículo (Facebook Marketplace)'
      ),
      label: msg('Vehicle condition', 'Condición del vehículo'),
    },
    vehicleType: {
      description: msg(
        'Car or truck (Facebook Marketplace)',
        'Auto o camioneta (Facebook Marketplace)'
      ),
      label: msg('Vehicle type', 'Tipo de vehículo'),
    },
    version: {
      label: msg('Version', 'Versión'),
    },
    year: {
      label: msg('Year', 'Año'),
    },
  },
  labels: {
    plural: msg('Cars', 'Autos'),
    singular: msg('Car', 'Auto'),
  },
  options: {
    bodyType: {
      convertible: msg('Convertible', 'Convertible'),
      coupe: msg('Coupe', 'Coupé'),
      hatchback: msg('Hatchback', 'Hatchback'),
      minivan: msg('Minivan', 'Minivan'),
      sedan: msg('Sedan', 'Sedán'),
      smallCar: msg('Small car', 'Auto pequeño'),
      suv: msg('SUV', 'SUV'),
      truck: msg('Truck', 'Camioneta'),
      wagon: msg('Wagon', 'Familiar'),
    },
    condition: {
      excellent: msg('Excellent', 'Excelente'),
      fair: msg('Fair', 'Aceptable'),
      good: msg('Good', 'Bueno'),
      poor: msg('Poor', 'Malo'),
      veryGood: msg('Very good', 'Muy bueno'),
    },
    fuelType: {
      diesel: msg('Diesel', 'Diésel'),
      electric: msg('Electric', 'Eléctrico'),
      gasoline: msg('Gasoline', 'Gasolina'),
      hybrid: msg('Hybrid', 'Híbrido'),
      plugInHybrid: msg('Plug-in hybrid', 'Híbrido Enchufable'),
    },
    ownerHistory: {
      multiple: msg('3 or more owners', '3 o más dueños'),
      single: msg('Single owner', 'Único dueño'),
      two: msg('2 owners', '2 dueños'),
    },
    status: {
      available: msg('🟢 Available', '🟢 Disponible'),
      reserved: msg('🟡 Reserved', '🟡 Apartado'),
      sold: msg('🔴 Sold', '🔴 Vendido'),
    },
    transmission: {
      automatic: msg('Automatic', 'Automática'),
      manual: msg('Manual', 'Manual'),
    },
    vehicleType: {
      car: msg('Car', 'Auto'),
      truck: msg('Truck', 'Camioneta'),
    },
  },

  tabs: {
    additionalDetails: {
      description: msg(
        'Features, history and location (optional).',
        'Características, historial y ubicación (opcional).'
      ),
      label: msg('Additional details', 'Detalles adicionales'),
    },
    facebookMarketplace: {
      description: msg(
        'Generate the Facebook Marketplace listing.',
        'Genera el listado de Facebook Marketplace.'
      ),
      label: msg('Facebook Marketplace', 'Facebook Marketplace'),
    },
    general: {
      description: msg('Core vehicle data.', 'Datos básicos del vehículo.'),
      label: msg('General', 'General'),
    },
    photos: {
      description: msg(
        'Featured image and vehicle galleries.',
        'Imagen destacada y galerías del vehículo.'
      ),
      label: msg('Photos', 'Fotos'),
    },
    price: {
      description: msg(
        'Sale price and financing options.',
        'Precio de venta y opciones de financiamiento.'
      ),
      label: msg('Price', 'Precio'),
    },
    specifications: {
      description: msg('Vehicle spec sheet.', 'Ficha técnica del vehículo.'),
      label: msg('Specifications', 'Especificaciones'),
    },
  },
}

export const cities = {
  description: msg(
    'Cities where you have a dealership. Each one gets its own landing page (/seminuevos/<slug>), so the name and slug are what search engines index.',
    'Ciudades donde tienes una agencia. Cada una genera su propia página (/seminuevos/<slug>), así que el nombre y el slug son lo que indexan los buscadores.'
  ),
  fields: {
    intro: {
      description: msg(
        'One or two paragraphs shown on that city’s page. Write something specific about selling there — it is what keeps the page from looking like a copy of the others.',
        'Uno o dos párrafos que se muestran en la página de esa ciudad. Escribe algo propio sobre vender ahí: es lo que evita que la página parezca una copia de las demás.'
      ),
      label: msg('Page intro', 'Introducción de la página'),
    },
    name: {
      description: msg(
        'City name as it should read on the site (e.g. Pachuca)',
        'Nombre de la ciudad como debe leerse en el sitio (ej. Pachuca)'
      ),
      label: msg('City', 'Ciudad'),
    },
    slug: {
      description: msg(
        'URL segment for this city. Generated from the name; change it only if you know what you are doing — editing it breaks the links already indexed.',
        'Segmento de URL de esta ciudad. Se genera del nombre; cámbialo solo si sabes lo que haces: editarlo rompe los enlaces ya indexados.'
      ),
      label: msg('Slug', 'Slug'),
    },
    state: {
      description: msg(
        'State this city belongs to (e.g. Hidalgo)',
        'Estado al que pertenece la ciudad (ej. Hidalgo)'
      ),
      label: msg('State', 'Estado'),
    },
  },
  labels: {
    plural: msg('Cities', 'Ciudades'),
    singular: msg('City', 'Ciudad'),
  },
}

export const colors = {
  description: msg(
    'Color catalog (exterior and interior). Add as many as you need.',
    'Catálogo de colores (exterior e interior). Agrega los que necesites.'
  ),
  fields: {
    hex: {
      description: msg(
        'Hex code for the visual swatch (e.g. #000000)',
        'Código hexadecimal para la muestra visual (ej. #000000)'
      ),
      label: msg('Color code (optional)', 'Código de color (opcional)'),
    },
    name: {
      description: msg(
        'Color name in Spanish, as shown on the site (e.g. Negro, Blanco, Gris Oxford)',
        'Nombre del color en español, como se ve en el sitio (ej. Negro, Blanco, Gris Oxford)'
      ),
      label: msg('Color', 'Color'),
    },
  },
  labels: {
    plural: msg('Colors', 'Colores'),
    singular: msg('Color', 'Color'),
  },
}

export const common = {
  address: msg('Address', 'Dirección'),
  brand: msg('Brand', 'Marca'),
  city: msg('City', 'Ciudad'),
  country: msg('Country', 'País'),
  description: msg('Description', 'Descripción'),
  email: msg('Email', 'Correo electrónico'),
  googleMapsUrl: msg(
    'Google Maps link (optional)',
    'Enlace de Google Maps (opcional)'
  ),
  model: msg('Model', 'Modelo'),
  name: msg('Name', 'Nombre'),
  phone: msg('Phone', 'Teléfono'),
  postalCode: msg('Postal code', 'Código postal'),
  state: msg('State', 'Estado'),
  whatsapp: msg('WhatsApp', 'WhatsApp'),
}

export const dealerships = {
  errors: {
    latitude: msg(
      'Latitude must be between -90 and 90 in decimal degrees (e.g. 20.6597).',
      'La latitud debe estar entre -90 y 90 en grados decimales (ej. 20.6597).'
    ),
    longitude: msg(
      'Longitude must be between -180 and 180 in decimal degrees (e.g. -103.3496).',
      'La longitud debe estar entre -180 y 180 en grados decimales (ej. -103.3496).'
    ),
  },
  fields: {
    closed: {
      label: msg('Closed', 'Cerrado'),
    },
    closes: {
      label: msg('Closes', 'Cierra'),
    },
    city: {
      description: msg(
        'City this dealership is in. Pick it from the list — its own page (/seminuevos/<city>) lists every car stored here, and the state on the site comes from the city too.',
        'Ciudad donde está esta agencia. Elígela de la lista: su página (/seminuevos/<ciudad>) lista todos los autos guardados aquí, y el estado que se muestra en el sitio también viene de la ciudad.'
      ),
    },
    coordinates: {
      description: msg(
        'Use DECIMAL degrees (e.g. 20.6597 and -103.3496), not degrees-minutes-seconds. In Google Maps: right-click the place → click the coordinates to copy them (they come in decimal).',
        'Usa grados DECIMALES (ej. 20.6597 y -103.3496), no grados-minutos-segundos. En Google Maps: clic derecho en el lugar → clic en las coordenadas para copiarlas (vienen en decimal).'
      ),
      label: msg('Coordinates (for the map)', 'Coordenadas (para el mapa)'),
    },
    dealershipPhoto: {
      description: msg(
        'Image shown on the location card.',
        'Imagen mostrada en la tarjeta de ubicación.'
      ),
      label: msg('Dealership photo', 'Foto del concesionario'),
    },
    friday: {
      label: msg('Friday', 'Viernes'),
    },
    googleMapsUrl: {
      description: msg(
        "For the 'Get directions' button.",
        "Para el botón 'Cómo llegar'."
      ),
    },
    latitude: {
      label: msg('Latitude', 'Latitud'),
    },
    line1: {
      label: msg('Street and number', 'Calle y número'),
    },
    longitude: {
      label: msg('Longitude', 'Longitud'),
    },
    monday: {
      label: msg('Monday', 'Lunes'),
    },
    neighborhood: {
      label: msg('Neighborhood', 'Colonia'),
    },
    opens: {
      description: msg('24h format', 'Formato 24h'),
      label: msg('Opens', 'Abre'),
    },
    saturday: {
      label: msg('Saturday', 'Sábado'),
    },
    sunday: {
      label: msg('Sunday', 'Domingo'),
    },
    thursday: {
      label: msg('Thursday', 'Jueves'),
    },
    tuesday: {
      label: msg('Tuesday', 'Martes'),
    },
    wednesday: {
      label: msg('Wednesday', 'Miércoles'),
    },
    whatsapp: {
      description: msg(
        'Digits only, including country code (e.g. 5233...). Optional.',
        'Solo dígitos, incluyendo código de país (ej. 5233...). Opcional.'
      ),
    },
  },
  labels: {
    plural: msg('Dealerships', 'Concesionarios'),
    singular: msg('Dealership', 'Concesionario'),
  },
  tabs: {
    general: {
      description: msg(
        'Main dealership data.',
        'Datos principales del concesionario.'
      ),
      label: msg('General', 'General'),
    },
    hours: {
      description: msg(
        'Opening hours per day. Used to show Open/Closed.',
        'Horario de apertura por día. Usado para mostrar Abierto/Cerrado.'
      ),
      label: msg('Hours', 'Horario'),
    },
    location: {
      description: msg(
        'Address and coordinates for the map.',
        'Dirección y coordenadas para el mapa.'
      ),
      label: msg('Location', 'Ubicación'),
    },
  },
}

export const contact = {
  description: msg(
    'Contact details shown in the footer and on the contact page.',
    'Datos de contacto mostrados en el pie de página y en la página de contacto.'
  ),
  fields: {
    hoursNote: {
      description: msg(
        'General opening hours shown on the contact page (optional).',
        'Horario general de atención mostrado en la página de contacto (opcional).'
      ),
      label: msg('Hours (text)', 'Horario (texto)'),
    },
    social: {
      description: msg(
        'Full links (https://...). Leave empty what you do not use.',
        'Enlaces completos (https://...). Deja vacío lo que no uses.'
      ),
      fields: {
        facebook: {
          label: msg('Facebook', 'Facebook'),
        },
        instagram: {
          label: msg('Instagram', 'Instagram'),
        },
        tiktok: {
          label: msg('TikTok', 'TikTok'),
        },
        youtube: {
          label: msg('YouTube', 'YouTube'),
        },
      },
      label: msg('Social media', 'Redes sociales'),
    },
    streetAndNumber: {
      label: msg('Street and number', 'Calle y número'),
    },
    whatsapp: {
      description: msg(
        'Digits only, including country code (e.g. 5255...). Used for the WhatsApp link.',
        'Solo dígitos, incluyendo código de país (ej. 5255...). Usado para el enlace de WhatsApp.'
      ),
    },
  },
  label: msg('Contact', 'Contacto'),
}

export const groups = {
  content: msg('Content', 'Contenido'),
  settings: msg('Settings', 'Configuración'),
}

export const homepage = {
  fields: {
    hero: {
      fields: {
        badge: {
          label: msg('Badge', 'Etiqueta'),
        },
        heading: {
          label: msg('Heading', 'Encabezado'),
        },
        headingHighlight: {
          description: msg(
            'Part of the title highlighted in red.',
            'Parte del título destacada en rojo.'
          ),
          label: msg('Heading highlight', 'Destacado del encabezado'),
        },
        subheading: {
          label: msg('Subheading', 'Subtítulo'),
        },
      },
      description: msg(
        'Title and copy for the main header.',
        'Título y texto para el encabezado principal.'
      ),
      label: msg('Hero text', 'Texto del hero'),
    },
    heroSlides: {
      description: msg(
        'Main carousel (header) images. Shown in list order.',
        'Imágenes del carrusel principal (encabezado). Se muestran en orden de lista.'
      ),
      fields: {
        caption: {
          description: msg(
            'Optional text shown over the image. Also used as the slide alt text (SEO) when the image has none of its own.',
            'Texto opcional mostrado sobre la imagen. También se usa como texto alternativo del slide (SEO) cuando la imagen no tiene uno propio.'
          ),
          label: msg('Caption', 'Pie de foto'),
        },
        image: {
          label: msg('Image', 'Imagen'),
        },
      },
      label: msg('Hero slides', 'Slides del hero'),
      labels: {
        plural: msg('Slides', 'Slides'),
        singular: msg('Slide', 'Slide'),
      },
    },
  },
  label: msg('Homepage', 'Portada'),
}

export const media = {
  fields: {
    alt: {
      description: msg(
        'Optional. If left empty, the site generates a descriptive alt text automatically: car photos use brand, model, version, year and city; slides use the caption or a default text. Fill it in only if you want a specific text.',
        'Opcional. Si lo dejas vacío, el sitio genera texto alternativo descriptivo automáticamente: las fotos de autos usan marca, modelo, versión, año y ciudad; los slides usan el caption o un texto por defecto. Complétalo solo si quieres un texto específico.'
      ),
      label: msg('Alt text', 'Texto alternativo'),
    },
  },
  labels: {
    plural: msg('Media', 'Multimedia'),
    singular: msg('Media', 'Multimedia'),
  },
}

export const siteSettings = {
  description: msg(
    'Site identity: brand, SEO, favicon, share image and colors.',
    'Identidad del sitio: marca, SEO, favicon, imagen para compartir y colores.'
  ),
  fields: {
    brand: {
      description: msg(
        'Brand name and copy shown on the site.',
        'Nombre de marca y texto mostrado en el sitio.'
      ),
      fields: {
        brandName: {
          label: msg('Brand name', 'Nombre de la marca'),
        },
        description: {
          description: msg(
            'Short description used in the footer.',
            'Descripción corta usada en el pie de página.'
          ),
        },
        showName: {
          description: msg(
            'Shows the brand name next to the logo in the top bar and footer. Turn it off if your logo already includes the name.',
            'Muestra el nombre de la marca junto al logo en la barra superior y el pie de página. Desactívalo si tu logo ya incluye el nombre.'
          ),
          label: msg('Show name next to logo', 'Mostrar nombre junto al logo'),
        },
        tagline: {
          label: msg('Tagline', 'Eslogan'),
        },
      },
      label: msg('Brand', 'Marca'),
    },
    seo: {
      description: msg(
        'Text seen by search engines (Google) and social networks when the site is shared.',
        'Texto visto por buscadores (Google) y redes sociales cuando se comparte el sitio.'
      ),
      fields: {
        description: {
          description: msg(
            'Long description (meta description).',
            'Descripción larga (meta descripción).'
          ),
          label: msg('SEO description', 'Descripción SEO'),
        },
        keywords: {
          fields: {
            value: {
              label: msg('Keyword', 'Palabra clave'),
            },
          },
          description: msg(
            'Keywords (one per row).',
            'Palabras clave (una por fila).'
          ),
          label: msg('Keywords', 'Palabras clave'),
        },
        ogDescription: {
          description: msg(
            'Short description for social media (Open Graph).',
            'Descripción corta para redes sociales (Open Graph).'
          ),
          label: msg('Social description', 'Descripción social'),
        },
        titleDefault: {
          description: msg(
            'Default title, also used on the home page.',
            'Título por defecto, también usado en la página de inicio.'
          ),
          label: msg('Default title', 'Título por defecto'),
        },
        titleTemplate: {
          description: msg(
            'Template for inner pages. Use %s where the page title goes.',
            'Plantilla para páginas internas. Usa %s donde va el título de la página.'
          ),
          label: msg('Title template', 'Plantilla de título'),
        },
      },
      label: msg('SEO', 'SEO'),
    },
    theme: {
      description: msg(
        'Brand colors. Applied to buttons, highlights and the loading bar.',
        'Colores de marca. Aplicados a botones, destacados y la barra de carga.'
      ),
      fields: {
        accent: {
          label: msg('Accent', 'Acento'),
        },
        accentStrong: {
          label: msg('Accent (hover)', 'Acento (hover)'),
        },
        primary: {
          description: msg(
            'Main neutral color (text, dark surfaces).',
            'Color neutro principal (texto, superficies oscuras).'
          ),
          label: msg('Primary', 'Primario'),
        },
      },
      label: msg('Colors', 'Colores'),
    },
    media: {
      description: msg(
        'Brand images. The logo shows in the top bar and footer; the favicon is the browser tab icon; the share image appears when the link is pasted on social media.',
        'Imágenes de marca. El logo se muestra en la barra superior y el pie de página; el favicon es el ícono de la pestaña del navegador; la imagen para compartir aparece cuando se pega el enlace en redes sociales.'
      ),
      fields: {
        favicon: {
          description: msg(
            'Browser tab icon (PNG or ICO).',
            'Ícono de pestaña del navegador (PNG o ICO).'
          ),
          label: msg('Favicon', 'Favicon'),
        },
        logo: {
          description: msg(
            'Brand logo (SVG, PNG or WebP). Displayed at 36 px tall, so use a file with a transparent background. If left empty the default icon is used.',
            'Logo de marca (SVG, PNG o WebP). Se muestra a 36 px de alto, así que usa un archivo con fondo transparente. Si se deja vacío se usa el ícono por defecto.'
          ),
          label: msg('Logo', 'Logo'),
        },
        ogImage: {
          description: msg(
            'Image shown when the site is shared (1200×630 recommended).',
            'Imagen mostrada cuando se comparte el sitio (1200×630 recomendado).'
          ),
          label: msg(
            'Share image (Open Graph)',
            'Imagen para compartir (Open Graph)'
          ),
        },
      },
      label: msg('Images', 'Imágenes'),
    },
  },
  label: msg('Site settings', 'Configuración del sitio'),
}

export const users = {
  fields: {
    roles: {
      label: msg('Roles', 'Roles'),
      options: {
        admin: msg('Admin', 'Administrador'),
        editor: msg('Editor', 'Editor'),
        user: msg('User', 'Usuario'),
      },
    },
  },
  labels: {
    plural: msg('Users', 'Usuarios'),
    singular: msg('User', 'Usuario'),
  },
}

export const ui = {
  copyBtn: {
    ariaLabel: msg(
      'Copy {field} to clipboard',
      'Copiar {field} al portapapeles'
    ),
    copied: msg('✓ Copied', '✓ Copiado'),
    copy: msg('Copy', 'Copiar'),
  },
  fields: {
    pickBrandFirst: msg('Pick a brand first', 'Elige una marca primero'),
    pickBrandModelYearFirst: msg(
      'Pick brand, model and year first',
      'Elige marca, modelo y año primero'
    ),
    selectBrand: msg('Select a brand', 'Selecciona una marca'),
    selectModel: msg('Select a model', 'Selecciona un modelo'),
    selectVersion: msg('Select a version', 'Selecciona una versión'),
    selectYear: msg('Select a year', 'Selecciona un año'),
  },
  marketplacePanel: {
    comingSoonAI: msg(
      'Generated automatically from the car data. (Coming soon: an option to write it with AI.)',
      'Generado automáticamente de los datos del auto. (Próximamente: una opción para escribirlo con IA.)'
    ),
    copyAllFields: msg('Copy all fields', 'Copiar todos los campos'),
    copyInstructions: msg(
      'Copy each value into its matching field in the Facebook form, and paste the description into the text field. The values use the same options as Facebook.',
      'Copia cada valor en su campo correspondiente en el formulario de Facebook, y pega la descripción en el campo de texto. Los valores usan las mismas opciones que Facebook.'
    ),
    descriptionFor: msg(
      "Description (for Facebook's text field)",
      'Descripción (para el campo de texto de Facebook)'
    ),
    heading: msg(
      '📋 Copy data for Facebook Marketplace',
      '📋 Copiar datos para Facebook Marketplace'
    ),
    noData: msg('— no data —', '— sin datos —'),
    photoCountPlural: msg('{count} photos', '{count} fotos'),
    photoCountSingular: msg('{count} photo', '{count} foto'),
    uploadNote: msg('upload up to 20 on Facebook', 'sube hasta 20 en Facebook'),
  },
}
