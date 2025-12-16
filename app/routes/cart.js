const express = require('express');
const router = express.Router();

// Tymczasowe przechowywanie koszyków w pamięci (w przyszłości session/DB)
// W produkcji użyj express-session z PostgreSQL store
const carts = new Map();

// Helper do pobrania koszyka
const getCart = (sessionId) => {
  if (!carts.has(sessionId)) {
    carts.set(sessionId, []);
  }
  return carts.get(sessionId);
};

// GET /api/cart - pobranie koszyka
router.get('/', (req, res) => {
  try {
    const sessionId = req.sessionID || 'anonymous';
    const cart = getCart(sessionId);
    
    // Oblicz total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
      success: true,
      cart,
      count: cart.length,
      total
    });
  } catch (error) {
    console.error('❌ Error fetching cart:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/cart/add - dodaj produkt do koszyka
router.post('/add', (req, res) => {
  try {
    const sessionId = req.sessionID || 'anonymous';
    const { productId, name, price, image, category, quantity = 1, metadata = {} } = req.body;
    
    if (!productId || !name || !price) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: productId, name, price'
      });
    }
    
    const cart = getCart(sessionId);
    
    // Sprawdź czy produkt już jest w koszyku
    const existingItem = cart.find(item => item.productId === productId);
    
    if (existingItem) {
      // Zwiększ ilość
      existingItem.quantity += quantity;
    } else {
      // Dodaj nowy produkt
      cart.push({
        productId,
        name,
        price,
        image,
        category,
        quantity,
        metadata, // np. rozmiar dla ubrań, licencja dla bitów
        addedAt: new Date().toISOString()
      });
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
      success: true,
      message: 'Product added to cart',
      cart,
      count: cart.length,
      total
    });
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PATCH /api/cart/:productId - zmień ilość produktu
router.patch('/:productId', (req, res) => {
  try {
    const sessionId = req.sessionID || 'anonymous';
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be at least 1'
      });
    }
    
    const cart = getCart(sessionId);
    const item = cart.find(item => item.productId === productId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Product not found in cart'
      });
    }
    
    item.quantity = quantity;
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
      success: true,
      message: 'Quantity updated',
      cart,
      count: cart.length,
      total
    });
  } catch (error) {
    console.error('❌ Error updating cart:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/cart/:productId - usuń produkt z koszyka
router.delete('/:productId', (req, res) => {
  try {
    const sessionId = req.sessionID || 'anonymous';
    const { productId } = req.params;
    
    const cart = getCart(sessionId);
    const index = cart.findIndex(item => item.productId === productId);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Product not found in cart'
      });
    }
    
    cart.splice(index, 1);
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    res.json({
      success: true,
      message: 'Product removed from cart',
      cart,
      count: cart.length,
      total
    });
  } catch (error) {
    console.error('❌ Error removing from cart:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/cart - wyczyść cały koszyk
router.delete('/', (req, res) => {
  try {
    const sessionId = req.sessionID || 'anonymous';
    carts.set(sessionId, []);
    
    res.json({
      success: true,
      message: 'Cart cleared',
      cart: [],
      count: 0,
      total: 0
    });
  } catch (error) {
    console.error('❌ Error clearing cart:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
