const express = require('express');
const router = express.Router();

// Baza produktów - w przyszłości z PostgreSQL
const PRODUCTS = {
  streetwear: [
    {
      id: 'sw-001',
      name: 'RSG BANDA HOODIE',
      category: 'streetwear',
      price: 299,
      image: '/images/60.png',
      badge: 'HOT',
      description: 'Czarna bluza z kapturem, haft RSG BANDA',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      stock: 15
    },
    {
      id: 'sw-002',
      name: 'UNDERGROUND TEE',
      category: 'streetwear',
      price: 149,
      image: '/images/logo.png',
      badge: 'NEW',
      description: 'Oversize t-shirt, 100% bawełna',
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 30
    },
    {
      id: 'sw-003',
      name: 'SNAPBACK BLACK/RED',
      category: 'streetwear',
      price: 99,
      image: '/images/60.png',
      badge: null,
      description: 'Czapka snapback z czerwonym logo',
      sizes: ['ONE SIZE'],
      stock: 20
    },
    {
      id: 'sw-004',
      name: 'TRACK PANTS',
      category: 'streetwear',
      price: 199,
      image: '/images/image.png',
      badge: null,
      description: 'Spodnie dresowe z lampasami',
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 12
    }
  ],
  muza: [
    {
      id: 'mz-001',
      name: 'RSG BANDA - ALBUM',
      category: 'muza',
      price: 49,
      image: '/images/60.png',
      badge: 'HOT',
      description: '12 tracków, download + CD',
      format: 'MP3 320kbps + Physical CD',
      tracks: 12,
      stock: 50
    },
    {
      id: 'mz-002',
      name: 'UNDERGROUND EP',
      category: 'muza',
      price: 29,
      image: '/images/logo.png',
      badge: 'NEW',
      description: '5 utworów, tylko digital',
      format: 'MP3 320kbps',
      tracks: 5,
      stock: 999
    },
    {
      id: 'mz-003',
      name: 'SINGLE - CIEŃ',
      category: 'muza',
      price: 9,
      image: '/images/image.png',
      badge: null,
      description: 'Najnowszy single + instrumental',
      format: 'MP3 320kbps',
      tracks: 2,
      stock: 999
    }
  ],
  bity: [
    {
      id: 'bt-001',
      name: 'DARK TRAP BEAT',
      category: 'bity',
      price: 199,
      image: '/images/60.png',
      badge: 'HOT',
      description: '140 BPM, mroczny trap',
      bpm: 140,
      key: 'F# minor',
      license: 'Basic (MP3 + WAV)',
      stock: 1
    },
    {
      id: 'bt-002',
      name: 'DRILL BANGER',
      category: 'bity',
      price: 249,
      image: '/images/logo.png',
      badge: 'NEW',
      description: '142 BPM, agresywny drill',
      bpm: 142,
      key: 'D minor',
      license: 'Premium (Stems)',
      stock: 1
    },
    {
      id: 'bt-003',
      name: 'BOOM BAP CLASSIC',
      category: 'bity',
      price: 179,
      image: '/images/image.png',
      badge: null,
      description: '90 BPM, oldschool vibes',
      bpm: 90,
      key: 'A minor',
      license: 'Basic (MP3 + WAV)',
      stock: 1
    },
    {
      id: 'bt-004',
      name: 'EXCLUSIVE PACK',
      category: 'bity',
      price: 299,
      image: '/images/60.png',
      badge: 'HOT',
      description: '150 BPM, pełne prawa',
      bpm: 150,
      key: 'C minor',
      license: 'Exclusive Rights',
      stock: 1
    }
  ]
};

// GET /api/products - wszystkie produkty lub filtrowane po kategorii
router.get('/', (req, res) => {
  const { category } = req.query;
  
  try {
    if (category && PRODUCTS[category]) {
      return res.json({
        success: true,
        category,
        count: PRODUCTS[category].length,
        products: PRODUCTS[category]
      });
    }
    
    // Wszystkie produkty
    const allProducts = [
      ...PRODUCTS.streetwear,
      ...PRODUCTS.muza,
      ...PRODUCTS.bity
    ];
    
    res.json({
      success: true,
      count: allProducts.length,
      products: allProducts,
      categories: {
        streetwear: PRODUCTS.streetwear.length,
        muza: PRODUCTS.muza.length,
        bity: PRODUCTS.bity.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/products/:id - pojedynczy produkt
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    // Szukaj w wszystkich kategoriach
    const allProducts = [
      ...PRODUCTS.streetwear,
      ...PRODUCTS.muza,
      ...PRODUCTS.bity
    ];
    
    const product = allProducts.find(p => p.id === id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
