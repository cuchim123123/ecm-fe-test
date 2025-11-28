import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/formatPrice';
import { parsePrice } from '@/utils/priceUtils';
import './CartItem.css';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    const navigate = useNavigate();

    // 1. Get Variant info
    // Prioritize data from adapter (item.variant)
    const itemVariant = item.variant || (typeof item.variantId === 'object' ? item.variantId : {});
    
    // 2. Get Product info
    // Prioritize data from adapter (item.product)
    const product = item.product || itemVariant?.productId || item.productId;

    // 3. Validation
    if (!product || (!product.name && !itemVariant.name)) {
        console.warn('Cart item missing product data:', item);
        return null; 
    }

    // 4. Get display values
    const price = parsePrice(
        item.price || itemVariant?.price || product.minPrice || 0
    );
    
    const imageUrl =
        itemVariant?.imageUrls?.[0] || product.imageUrls?.[0] || '/placeholder.png';
        
    const stock = itemVariant?.stockQuantity || product.stockQuantity || 999;
    const total = price * item.quantity;
    
    // Get SKU
    const sku = itemVariant?.sku || product.sku || '';

    // 5. Format attributes
    let variantAttributes = '';
    if (itemVariant?.attributes) {
        const attrs = Array.isArray(itemVariant.attributes) 
            ? itemVariant.attributes 
            : Object.entries(itemVariant.attributes).map(([k, v]) => ({ name: k, value: v }));

        variantAttributes = attrs
            .map((attr) => {
                if (attr.name === "Type") return attr.value;
                return `${attr.name}: ${attr.value}`;
            })
            .join(' • ');
    }

    // 6. Event handlers
    const itemId = item._id || item.id;

    const handleDecrement = () => {
        if (item.quantity > 1) {
            onUpdateQuantity(itemId, item.quantity - 1);
        }
    };

    const handleIncrement = () => {
        if (item.quantity < stock) {
            onUpdateQuantity(itemId, item.quantity + 1);
        }
    };

    const handleNavigateToProduct = () => {
        if (product._id) {
            navigate(`/products/${product._id}`);
        }
    };

    return (
        <div className="cart-item">
            <div className="cart-item-image-wrapper" onClick={handleNavigateToProduct}>
                <img src={imageUrl} alt={product.name || 'Product'} className="cart-item-image" />
            </div>

            <div className="cart-item-info">
                <h3 className="cart-item-name" onClick={handleNavigateToProduct}>
                    {product.name || "Unknown Product"}
                </h3>
                
                {/* Category Name */}
                {product.categoryId?.[0]?.name && (
                    <p className="cart-item-category">{product.categoryId[0].name}</p>
                )}

                {/* Variant Info */}
                {variantAttributes && (
                    <p className="cart-item-variant">
                        <span className="variant-label">Variant: </span>
                        <span className="variant-value">{variantAttributes}</span>
                    </p>
                )}

                {/* [MOVED] SKU is now here (Above Price) */}
                {sku && (
                    <p className="cart-item-sku text-xs text-gray-500 mb-1">
                        SKU: {sku}
                    </p>
                )}

                <p className="cart-item-price">{formatPrice(price)}</p>

                {/* Stock Warning (Translated) */}
                {stock < 10 && stock > 0 && (
                    <span className="cart-item-stock-warning">Only {stock} left in stock</span>
                )}
                {stock === 0 && (
                    <span className="cart-item-out-of-stock">Out of stock</span>
                )}
            </div>

            <div className="cart-item-quantity">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDecrement}
                    disabled={item.quantity <= 1}
                    className="quantity-btn"
                >
                    <Minus size={16} />
                </Button>
                <span className="quantity-value">{item.quantity}</span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleIncrement}
                    disabled={item.quantity >= stock}
                    className="quantity-btn"
                >
                    <Plus size={16} />
                </Button>
            </div>

            <div className="cart-item-total">
                <span className="total-label">Total:</span>
                <span className="total-price">{formatPrice(total)}</span>
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(itemId)}
                className="remove-btn"
            >
                <Trash2 size={20} />
            </Button>
        </div>
    );
};

export default CartItem;