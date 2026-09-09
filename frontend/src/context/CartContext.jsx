import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY_HOTEL = 'carry_hotel_name';
const STORAGE_KEY_CART = 'carry_cart_items';

export function CartProvider({ children }) {
  // Load hotel name from localStorage
  const [hotelName, setHotelNameState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_HOTEL) || '';
  });

  // Cart items stored as an object: { [productId]: { product, quantity } }
  const [cartMap, setCartMap] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cartMap));
  }, [cartMap]);

  const setHotelName = (name) => {
    const trimmed = (name || '').trim();
    setHotelNameState(trimmed);
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY_HOTEL, trimmed);
    } else {
      localStorage.removeItem(STORAGE_KEY_HOTEL);
    }
  };

  const getItemQuantity = (productId) => {
    return cartMap[productId]?.quantity || 0;
  };

  const incrementProduct = (product) => {
    setCartMap((prev) => {
      const currentQty = prev[product.id]?.quantity || 0;
      const newQty = currentQty + 1;
      return {
        ...prev,
        [product.id]: {
          product,
          quantity: newQty,
        },
      };
    });
  };

  const decrementProduct = (product) => {
    setCartMap((prev) => {
      const currentQty = prev[product.id]?.quantity || 0;
      if (currentQty <= 0) return prev;

      const newQty = currentQty - 1;
      const nextMap = { ...prev };

      if (newQty === 0) {
        delete nextMap[product.id];
      } else {
        nextMap[product.id] = {
          product,
          quantity: newQty,
        };
      }
      return nextMap;
    });
  };

  const setProductQuantity = (product, quantity) => {
    const qty = Math.max(0, parseInt(quantity, 10) || 0);
    setCartMap((prev) => {
      const nextMap = { ...prev };
      if (qty === 0) {
        delete nextMap[product.id];
      } else {
        nextMap[product.id] = { product, quantity: qty };
      }
      return nextMap;
    });
  };

  const removeProduct = (productId) => {
    setCartMap((prev) => {
      const nextMap = { ...prev };
      delete nextMap[productId];
      return nextMap;
    });
  };

  const clearCart = () => {
    setCartMap({});
  };

  // Convert map to array of items
  const cartItems = useMemo(() => {
    return Object.values(cartMap);
  }, [cartMap]);

  // Total quantity count
  const totalCount = useMemo(() => {
    return cartItems.reduce((acc, it) => acc + it.quantity, 0);
  }, [cartItems]);

  // Grand total amount in ₹
  const totalAmount = useMemo(() => {
    return cartItems.reduce((acc, it) => acc + it.product.price * it.quantity, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        hotelName,
        setHotelName,
        cartMap,
        cartItems,
        totalCount,
        totalAmount,
        getItemQuantity,
        incrementProduct,
        decrementProduct,
        setProductQuantity,
        removeProduct,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isConfirmModalOpen,
        setIsConfirmModalOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
