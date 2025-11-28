import React, { createContext, useContext, useEffect } from 'react';
import { useCart as useCartLogic } from "../hooks/useCartLogic";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    // Gọi hook logic tại đây (Chỉ gọi 1 lần duy nhất cho toàn app)
    const cartData = useCartLogic();

    return (
        <CartContext.Provider value={cartData}>
            {children}
        </CartContext.Provider>
    );
};

// Hook mới để các component con sử dụng
export const useCartContext = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCartContext must be used within a CartProvider");
    }
    return context;
};