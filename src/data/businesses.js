// GoaSmart Local Business Marketplace Dataset
export const INITIAL_BUSINESSES = [
  {
    id: 'biz-1',
    name: 'Dona Florinda Heritage Homestay',
    ownerName: 'Maria & Anthony Fernandes',
    region: 'Central Goa',
    taluka: 'Tiswadi',
    location: 'Divar Island, near Piedade Church',
    category: 'Homestays and accommodations',
    experienceType: 'Village Heritage',
    rating: 4.9,
    reviewsCount: 142,
    startingPrice: 2400,
    priceUnit: 'per night',
    isLesserKnown: true,
    isFairVisibilityFeatured: true,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
    description: 'A 180-year-old restored Portuguese colonial manor nestled among paddy fields and mango groves on car-free Divar Island. Includes homemade Goan poi breakfast and bicycles for village rides.',
    services: [
      'Private Suite with antique four-poster bed',
      'Traditional Goan buffet breakfast included',
      'Free village bicycles and ferry pick-up',
      'Sunset veranda overlooking Mandovi wetlands'
    ],
    contact: '+91 98221 44812 / info@donaflorindahomestay.in',
    operatingHours: 'Check-in: 01:00 PM • Check-out: 11:00 AM',
    experiences: [
      { name: 'Heritage Villa Overnight Stay', price: 2400, duration: '1 Night', per: 'per room' },
      { name: 'Divar Island Sunset Cycling Tour', price: 450, duration: '2 Hours', per: 'per person' }
    ]
  },
  {
    id: 'biz-2',
    name: 'Fernandes Family Seafood & Clam Shack',
    ownerName: 'Santosh & Sunita Fernandes',
    region: 'South Goa',
    taluka: 'Canacona',
    location: 'Galgibaga Beach Estuary',
    category: 'Local restaurants and food experiences',
    experienceType: 'Culinary & Dining',
    rating: 4.8,
    reviewsCount: 260,
    startingPrice: 350,
    priceUnit: 'per meal',
    isLesserKnown: true,
    isFairVisibilityFeatured: true,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80',
    description: 'A simple, family-run beachfront open-air restaurant right next to the Galgibaga river estuary. Specializes in fresh Tisreo (river clam masala), whole Kingfish rawa fry, and organic coconut solkadhi.',
    services: [
      'Catch-of-the-day fresh river and sea fish',
      'Authentic Goan Saraswat & Catholic recipes',
      'Organic home-brewed Kokum Solkadhi',
      'Plastic-free, eco-friendly beach dining'
    ],
    contact: '+91 97645 88219',
    operatingHours: '11:30 AM - 04:00 PM & 06:30 PM - 09:30 PM',
    experiences: [
      { name: 'Signature Goan Kingfish Thali Feast', price: 350, duration: '1.5 Hours', per: 'per person' },
      { name: 'Sunset Clam & Crab Tasting Experience', price: 650, duration: '2 Hours', per: 'per person' }
    ]
  },
  {
    id: 'biz-3',
    name: 'Sal River Mangrove Kayaking Guides',
    ownerName: 'Captain Xavier D’Silva',
    region: 'South Goa',
    taluka: 'Salcete',
    location: 'Betul Estuary & Mobor River Bank',
    category: 'Adventure activities',
    experienceType: 'Eco & Adventure',
    rating: 4.9,
    reviewsCount: 185,
    startingPrice: 600,
    priceUnit: 'per person',
    isLesserKnown: true,
    isFairVisibilityFeatured: true,
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80',
    description: 'Guided quiet sea kayaking tours through sheltered mangrove canopies along the Sal River. Spot river otters, nesting kingfishers, and eagles away from commercial jet skis.',
    services: [
      'Tandem & single sit-on-top sea kayaks',
      'Coast Guard certified buoyancy life vests',
      'Experienced local Goan naturalist guide',
      'Complimentary waterproof camera photos'
    ],
    contact: '+91 94220 56711',
    operatingHours: '06:30 AM - 10:30 AM & 04:00 PM - 06:30 PM',
    experiences: [
      { name: 'Sunrise Mangrove Creek Kayak Safari', price: 600, duration: '2 Hours', per: 'per person' },
      { name: 'Sunset Estuary Bioluminescence Paddle', price: 900, duration: '2 Hours', per: 'per person' }
    ]
  },
  {
    id: 'biz-4',
    name: 'Netravali Organic Spice Farm & Treehouse',
    ownerName: 'Prashant Kamat',
    region: 'South Goa',
    taluka: 'Sanguem',
    location: 'Netravali Village, near Bubbling Lake',
    category: 'Traditional Goan workshops',
    experienceType: 'Agro-Tourism',
    rating: 4.7,
    reviewsCount: 310,
    startingPrice: 450,
    priceUnit: 'per tour',
    isLesserKnown: true,
    isFairVisibilityFeatured: false,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80',
    description: 'A 25-acre certified organic spice plantation cultivating cinnamon, cardamom, vanilla, and nutmeg under dense Western Ghats canopy. Features guided spice foraging and a buffet lunch served on banana leaves.',
    services: [
      'Guided botanical spice walk & harvesting tips',
      'Traditional Goan wood-fired buffet lunch',
      'Herbal tea & fresh lemongrass refreshments',
      'Farm-direct pure organic spice shop'
    ],
    contact: '+91 98230 11994',
    operatingHours: '09:30 AM - 05:00 PM Daily',
    experiences: [
      { name: 'Guided Spice Walk & Banana Leaf Lunch', price: 450, duration: '3 Hours', per: 'per person' },
      { name: 'Whole Day Spice Farm + Jungle Waterfall Trek', price: 950, duration: '6 Hours', per: 'per person' }
    ]
  },
  {
    id: 'biz-5',
    name: 'Fontainhas Heritage Walk & Bakery Trail',
    ownerName: 'Clara Noronha',
    region: 'Central Goa',
    taluka: 'Tiswadi',
    location: 'Fontainhas Latin Quarter, Panaji',
    category: 'Guided tours',
    experienceType: 'Culture & Heritage',
    rating: 4.9,
    reviewsCount: 420,
    startingPrice: 500,
    priceUnit: 'per person',
    isLesserKnown: false,
    isFairVisibilityFeatured: true,
    image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=1000&q=80',
    description: 'Immersive walking exploration led by a native Goan architectural historian through Asia’s only Latin Quarter. Sample hot Bebinca and fresh Poi at traditional 100-year-old wood-fired bakeries.',
    services: [
      '2-hour historic architectural storytelling',
      'Tastings at 31st January Bakery & Confectioneries',
      'Fado guitar performance audio preview',
      'Small group limit (Max 8 participants)'
    ],
    contact: '+91 99214 77301',
    operatingHours: '08:00 AM - 10:30 AM & 04:30 PM - 07:00 PM',
    experiences: [
      { name: 'Latin Quarter Morning Heritage & Bakery Walk', price: 500, duration: '2.5 Hours', per: 'per person' }
    ]
  },
  {
    id: 'biz-6',
    name: 'Bicholim Red Clay Terracotta Pottery Studio',
    ownerName: 'Mahesh Satarkar',
    region: 'North Goa',
    taluka: 'Bicholim',
    location: 'Bordem, Bicholim Art Cluster',
    category: 'Local handicrafts and products',
    experienceType: 'Artisan Workshop',
    rating: 4.8,
    reviewsCount: 95,
    startingPrice: 400,
    priceUnit: 'per session',
    isLesserKnown: true,
    isFairVisibilityFeatured: true,
    image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1000&q=80',
    description: 'Hands-on terracotta wheel throwing workshop led by a master artisan from Bicholim’s 300-year-old clay guild. Create your own Goan decorative pot or clay tea cup to bring home.',
    services: [
      'Traditional potter wheel guidance',
      'Natural laterite red clay provided',
      'Kiln-firing of finished artwork',
      'Artisan direct sales of Goan handicrafts'
    ],
    contact: '+91 97632 99120',
    operatingHours: '10:00 AM - 06:00 PM (Closed Sundays)',
    experiences: [
      { name: 'Hands-On Pottery Wheel Experience (Take Home Pot)', price: 400, duration: '1.5 Hours', per: 'per person' }
    ]
  },
  {
    id: 'biz-7',
    name: 'Chorao Mangrove Canoe Birding Tours',
    ownerName: 'Pravin Gaonkar',
    region: 'Central Goa',
    taluka: 'Tiswadi',
    location: 'Chorao Ferry Jetty & Salim Ali Sanctuary',
    category: 'Guided tours',
    experienceType: 'Eco & Birding',
    rating: 4.8,
    reviewsCount: 160,
    startingPrice: 350,
    priceUnit: 'per person',
    isLesserKnown: true,
    isFairVisibilityFeatured: true,
    image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80',
    description: 'Silent oar-paddle canoe tours navigating deep through the dense mangrove estuaries of Dr. Salim Ali Bird Sanctuary. Low-tide bird spotting guided by local village fishermen.',
    services: [
      'Silent manual paddle canoe (zero engine noise)',
      'High-zoom binoculars for bird watching',
      'Sightings of Kingfishers, Ospreys, and Mudskippers',
      'Village herbal tea & local Goan snacks'
    ],
    contact: '+91 98812 66034',
    operatingHours: '06:30 AM - 09:30 AM Daily',
    experiences: [
      { name: 'Dawn Silent Canoe Birding Trip', price: 350, duration: '2 Hours', per: 'per person' }
    ]
  },
  {
    id: 'biz-8',
    name: 'Traditional Goan Saraswat Cooking Studio',
    ownerName: 'Chef Ananya Shenvi',
    region: 'Central Goa',
    taluka: 'Ponda',
    location: 'Priol, near Mangeshi Temple',
    category: 'Cultural experiences',
    experienceType: 'Culinary Workshop',
    rating: 4.9,
    reviewsCount: 190,
    startingPrice: 750,
    priceUnit: 'per class',
    isLesserKnown: true,
    isFairVisibilityFeatured: true,
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80',
    description: 'Learn the secrets of traditional Hindu Goan cooking using freshly ground coconut, teppal spices, and kokum in an ancestral courtyard kitchen. Prepare Khatkhate and Patoli desserts.',
    services: [
      'Interactive hands-on 4-course cooking class',
      'Traditional stone grinding (Rogdo) demonstration',
      'Sit-down feast with all cooked dishes',
      'Printed keepsake recipe booklet'
    ],
    contact: '+91 94038 22109',
    operatingHours: '10:30 AM - 02:00 PM (Tuesdays & Saturdays)',
    experiences: [
      { name: '4-Course Traditional Goan Cooking Masterclass', price: 750, duration: '3.5 Hours', per: 'per person' }
    ]
  }
];

export const MARKETPLACE_CATEGORIES = [
  'All Categories',
  'Homestays and accommodations',
  'Local restaurants and food experiences',
  'Guided tours',
  'Adventure activities',
  'Cultural experiences',
  'Traditional Goan workshops',
  'Local handicrafts and products'
];

export const SAMPLE_BOOKINGS = [
  {
    id: 'BK-101',
    businessId: 'biz-1',
    businessName: 'Dona Florinda Heritage Homestay',
    customerName: 'Rahul & Priya Sharma',
    serviceName: 'Heritage Villa Overnight Stay',
    date: '2026-11-28',
    guests: 2,
    totalAmount: 2400,
    status: 'Confirmed',
    requestTime: '2 hours ago'
  },
  {
    id: 'BK-102',
    businessId: 'biz-3',
    businessName: 'Sal River Mangrove Kayaking Guides',
    customerName: 'Arjun Verma',
    serviceName: 'Sunrise Mangrove Creek Kayak Safari',
    date: '2026-11-29',
    guests: 3,
    totalAmount: 1800,
    status: 'Pending',
    requestTime: 'Today at 09:15 AM'
  },
  {
    id: 'BK-103',
    businessId: 'biz-2',
    businessName: 'Fernandes Family Seafood & Clam Shack',
    customerName: 'Sneha Patel',
    serviceName: 'Signature Goan Kingfish Thali Feast',
    date: '2026-11-27',
    guests: 4,
    totalAmount: 1400,
    status: 'Completed',
    requestTime: 'Yesterday'
  }
];
