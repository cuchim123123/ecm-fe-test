import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { ROUTES } from '@/config/routes';
import CartItem from './components/CartItem';
import CartSummary from './components/CartSummary';
import EmptyCart from './components/EmptyCart';
import { useCartContext } from '@/context/CartContext';
import './Cart.css';

const Cart = () => {
    const navigate = useNavigate();
    const {
        cartItems,
        loading,
        error,
        cartSummary,
        updateItemQuantity,
        removeItem,
        clearAllItems,
    } = useCartContext();

    const [showClearConfirm, setShowClearConfirm] = React.useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = React.useState(false);
    const [itemToRemove, setItemToRemove] = React.useState(null);

    const subtotal = cartSummary?.subtotal || 0;

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        await updateItemQuantity(itemId, newQuantity);
    };

    const handleRemoveItem = (itemId) => {
        setItemToRemove(itemId);
        setShowRemoveConfirm(true);
    };

    const confirmRemoveItem = async () => {
        if (!itemToRemove) return;
        try {
            await removeItem(itemToRemove);
        } finally {
            setShowRemoveConfirm(false);
            setItemToRemove(null);
        }
    };

    const handleClearCart = () => {
        setShowClearConfirm(true);
    };

    const confirmClearCart = async () => {
        try {
            await clearAllItems();
        } finally {
            setShowClearConfirm(false);
        }
    };

    if (loading) {
        return (
            <div className="cart-loading">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        // Don't show error page for "cart not found" - it's normal
        if (!error.includes('not found') && !error.includes('404')) {
            return (
                <div className="cart-error">
                    <ErrorMessage message={error} />
                </div>
            );
        }
        // Treat "not found" as empty cart
    }

    if (!cartItems || cartItems.length === 0) {
        return <EmptyCart />;
    }

    return (
        <div className="cart-container">
            {/* Header */}
            <div className="cart-header">
                <div className="cart-title-wrapper">
                    <ShoppingBag size={32} />
                    <h1 className="cart-title">Shopping Cart</h1>
                    <span className="cart-count">
                        ({cartItems.length} items)
                    </span>
                </div>
                <Button
                    variant="outline"
                    onClick={handleClearCart}
                    className="clear-cart-btn"
                >
                    Clear Cart
                </Button>
            </div>

            <div className="cart-content">
                {/* Cart Items List */}
                <div className="cart-items-section">
                    {cartItems.map((item) => (
                        <CartItem
                            key={item.id}
                            item={item}
                            onUpdateQuantity={handleUpdateQuantity}
                            onRemove={handleRemoveItem}
                        />
                    ))}
                </div>

                {/* Cart Summary */}
                <div className="cart-summary-section">
                    <CartSummary
                        subtotal={subtotal}
                        onCheckout={() => navigate(ROUTES.CHECKOUT)}
                        onContinueShopping={() => navigate(ROUTES.PRODUCTS)}
                    />
                </div>
            </div>

            {/* Confirmation Dialogs */}
            <ConfirmDialog
                open={showClearConfirm}
                onOpenChange={setShowClearConfirm}
                onConfirm={confirmClearCart}
                title="Clear Cart"
                description="Are you sure you want to clear your cart? This action cannot be undone."
                confirmText="Clear Cart"
                cancelText="Cancel"
                variant="destructive"
            />

            <ConfirmDialog
                open={showRemoveConfirm}
                onOpenChange={setShowRemoveConfirm}
                onConfirm={confirmRemoveItem}
                title="Remove Item"
                description="Are you sure you want to remove this item from your cart?"
                confirmText="Remove"
                cancelText="Cancel"
                variant="destructive"
            />
        </div>
    );
};

export default Cart;
