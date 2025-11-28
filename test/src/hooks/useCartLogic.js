import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// [THAY ĐỔI] Import đúng tên hàm mới từ service
import {
    getCartByUser,
    getCartBySession,
    createCart,
    clearCart,
    deleteCart,
    addItem as apiAddItem, // Thay cho createCartItem
    removeItem as apiRemoveItem, // Thay cho deleteCartItem & updateCartItem (giảm)
} from '../services';
import { useAuth } from './useAuth';

import { getSocket } from '../services/socket';

/**
 * Custom hook for cart management
 * Handles both authenticated user carts and guest session carts
 */
export const useCart = () => {
    const { user, loading: authLoading } = useAuth();

    const [cart, setCart] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false); // Only for initial load or major actions (clear/delete)
    const [error, setError] = useState(null);

    // REFS:
    // 1. Keep a ref of cartItems to avoid stale-closure reads in async callbacks
    const cartItemsRef = useRef([]);
    // 2. Track pending updates and timeouts for debouncing
    const updateTimeoutsRef = useRef(new Map());
    // 3. Track request IDs to prevent race conditions (ignore old responses)
    const requestIdRef = useRef(new Map());

    // Sync Ref with State
    useEffect(() => {
        cartItemsRef.current = cartItems;
    }, [cartItems]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Clear all pending timeouts when component unmounts
            updateTimeoutsRef.current.forEach((timeoutId) =>
                clearTimeout(timeoutId),
            );
            updateTimeoutsRef.current.clear();
        };
    }, []);

    // Helper: Normalize ID (handle _id vs id)
    const getItemId = (item) => item?.id || item?._id;

    // Get or create session ID for guest users
    const getSessionId = useCallback(() => {
        let sessionId = localStorage.getItem('guestSessionId');
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            localStorage.setItem('guestSessionId', sessionId);
        }
        return sessionId;
    }, []);

    // Fetch cart based on user authentication status
    const fetchCart = useCallback(async () => {
        if (authLoading) return;

        try {
            setError(null);
            let cartData = null;

            // 1. Gọi API lấy dữ liệu thô từ Backend
            if (user?._id) {
                try {
                    cartData = await getCartByUser(user._id);
                } catch (err) {
                    if (err.response?.status !== 404) console.error(err);
                }
            } else {
                try {
                    cartData = await getCartBySession(getSessionId());
                } catch (err) {
                    if (err.response?.status !== 404) console.error(err);
                }
            }

            // 2. Set state cho cart tổng
            setCart(cartData);

            // 3. [QUAN TRỌNG] ADAPTER - CHUYỂN ĐỔI DỮ LIỆU CHO UI
            if (cartData && Array.isArray(cartData.items)) {
                // console.log('🔥 RAW ITEMS FROM BACKEND:', cartData.items);

                const adaptedItems = cartData.items.map((item) => {
                    // 1. Lấy Variant (JSON của bạn dùng key "variant")
                    // Kiểm tra kỹ xem nó là object hay null
                    const rawVariant =
                        item.variant && typeof item.variant === 'object'
                            ? item.variant
                            : {};

                    // 2. Lấy Product (Nằm TRONG variant.productId theo JSON bạn gửi)
                    // item.product ở ngoài chỉ là string ID, không dùng được
                    const rawProduct =
                        rawVariant.productId &&
                        typeof rawVariant.productId === 'object'
                            ? rawVariant.productId
                            : {};

                    // 3. Xử lý Giá (JSON item.price là số 350000, nhưng đề phòng Decimal128)
                    let finalPrice = item.price || rawVariant.price || 0;
                    if (typeof finalPrice === 'object' && finalPrice !== null) {
                        finalPrice = parseFloat(
                            finalPrice.$numberDecimal || finalPrice.value || 0,
                        );
                    }

                    if (!rawProduct.name)
                        console.warn('Missing Name for Item:', item);

                    // 4. Return cấu trúc chuẩn cho UI (CartItem.jsx)
                    return {
                        id: item._id || item.id,
                        cartId: cartData._id || cartData.id,
                        quantity: item.quantity,
                        price: finalPrice,

                        product: {
                            _id: rawProduct._id || rawProduct.id,
                            // [FIX] Nếu không có tên product, thử lấy tên từ variant, hoặc hiển thị text mặc định
                            name:
                                rawProduct.name ||
                                rawVariant.name ||
                                'Sản phẩm chưa cập nhật tên',
                            slug: rawProduct.slug,
                            imageUrls: Array.isArray(rawProduct.imageUrls)
                                ? rawProduct.imageUrls
                                : [],
                            minPrice: rawProduct.minPrice,
                            maxPrice: rawProduct.maxPrice,
                            stockQuantity: 999,
                        },

                        variant: {
                            _id: rawVariant._id || rawVariant.id,
                            productId: rawProduct._id,
                            // [FIX] Nếu SKU null hoặc undefined, trả về chuỗi rỗng để UI ẩn đi thay vì hiện lỗi
                            sku: rawVariant.sku || '',
                            price: finalPrice,
                            stockQuantity: rawVariant.stockQuantity,
                            attributes: rawVariant.attributes,
                            imageUrls: Array.isArray(rawVariant.imageUrls)
                                ? rawVariant.imageUrls
                                : [],
                        },
                    };
                });

                // console.log('✅ ADAPTED ITEMS:', adaptedItems);
                setCartItems(adaptedItems);
            } else {
                setCartItems([]);
            }
        } catch (err) {
            console.error('Error fetching cart:', err);
            setError('Không thể tải giỏ hàng');
            setCart(null);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    }, [user, getSessionId, authLoading]);

    // Initialize cart on mount
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Create or get cart
    const ensureCart = useCallback(async () => {
        // Check current state or ref
        if (cart?.id || cart?._id) return cart;

        try {
            const sessionId = user?._id ? undefined : getSessionId();
            const cartData = user?._id ? { userId: user._id } : { sessionId };
            const newCart = await createCart(cartData);
            setCart(newCart);
            return newCart;
        } catch (err) {
            console.error('Error in ensureCart:', err);
            setError(err.message || 'Failed to create cart');
            throw err;
        }
    }, [cart, user, getSessionId]);

    // Add item to cart
    const addItem = useCallback(
        async (productId, quantity = 1, variantId = null) => {
            // NOTE: removed setLoading(true) to avoid full page spinner on "Add to Cart"
            try {
                setError(null);
                const currentCart = await ensureCart();
                const currentCartId = getItemId(currentCart);

                // Check against REF to avoid stale closure issues
                const existingItem = cartItemsRef.current.find((item) => {
                    if (variantId) {
                        return (
                            item.productId === productId &&
                            item.variantId === variantId
                        );
                    }
                    return item.productId === productId && !item.variantId;
                });

                if (existingItem) {
                    // Optimistic Update for existing item
                    const existingId = getItemId(existingItem);
                    const newQuantity = existingItem.quantity + quantity;

                    setCartItems((prev) =>
                        prev.map((item) =>
                            getItemId(item) === existingId
                                ? { ...item, quantity: newQuantity }
                                : item,
                        ),
                    );

                    await apiAddItem(currentCartId, {
                        variantId: variantId || existingItem.variantId._id, // Lưu ý: item backend trả về variant là object, cần lấy ._id
                        quantity,
                        userId: user?._id, // Gửi kèm userId để socket hoạt động (nếu guest)
                    });
                } else {
                    // [THAY ĐỔI] Gọi API mới cho item mới
                    // Backend trả về Cart object hoàn chỉnh, ta lấy item mới từ đó hoặc fetch lại
                    await apiAddItem(currentCartId, {
                        variantId: variantId, // Bắt buộc phải có variantId
                        quantity,
                        userId: user?._id,
                    });

                    // Vì backend trả về cả Cart, tốt nhất là gọi fetchCart() để đồng bộ lại ID thật
                    // Nếu muốn giữ Optimistic cho new item thì hơi khó vì chưa có _id thật
                    fetchCart();
                }

                // Update cart totals (Optimistic-ish)
                if (cart) {
                    setCart((prev) => ({
                        ...prev,
                        itemCount: (prev.itemCount || 0) + quantity,
                    }));
                }
            } catch (err) {
                console.error('[CART] addItem failed:', err);
                setError(err.message || 'Failed to add item to cart');
                // Revert/Sync on error
                fetchCart();
                throw err;
            }
        },
        [ensureCart, cart, fetchCart], // Removed cartItems from dependency to prevent churn
    );

    // Remove item from cart
    const removeItem = useCallback(
        async (itemId) => {
            // 1. Lấy thông tin item từ Ref để phục vụ Revert nếu lỗi
            const itemToRemove = cartItemsRef.current.find(
                (item) => getItemId(item) === itemId,
            );

            if (!itemToRemove) return;

            try {
                setError(null);

                // 2. Optimistic Update (Cập nhật giao diện ngay lập tức)
                // 2.1. Xóa khỏi danh sách item
                setCartItems((prev) =>
                    prev.filter((item) => getItemId(item) !== itemId),
                );

                // 2.2. [THÊM] Trừ số lượng tổng trên giỏ hàng ngay lập tức
                if (cart) {
                    setCart((prev) => ({
                        ...prev,
                        itemCount: Math.max(0, (prev.itemCount || 0) - (itemToRemove.quantity || 1)),
                        // Tạm thời chưa trừ totalPrice vì cần tính toán phức tạp, 
                        // để socket hoặc fetchCart cập nhật sau cũng được.
                    }));
                }

                // 3. Gọi API Xóa Mới
                // [FIX] Lấy variantId chuẩn từ Adapter (ưu tiên variant._id)
                const variantId = itemToRemove.variant?._id || itemToRemove.variantId?._id || itemToRemove.variantId;

                if (!variantId) {
                    throw new Error("Missing Variant ID");
                }

                await apiRemoveItem(cart?.id || cart?._id, {
                    variantId,
                    quantity: itemToRemove.quantity, // Gửi toàn bộ số lượng để xóa sạch
                    userId: user?._id,
                });

                // [ĐÃ XÓA] Dòng await deleteCartItem(itemId) thừa thãi ở đây

            } catch (err) {
                setError(err.message || 'Failed to remove item');
                console.error('Error removing item:', err);

                // 4. Revert (Hoàn tác nếu lỗi)
                if (itemToRemove) {
                    setCartItems((prev) => [...prev, itemToRemove]);
                    
                    // Revert totals
                    if (cart) {
                        setCart((prev) => ({
                            ...prev,
                            itemCount: (prev.itemCount || 0) + (itemToRemove.quantity || 1),
                        }));
                    }
                }
                throw err;
            }
        },
        [cart, user], // cartItems không cần dependency vì dùng ref
    );

    // Update item quantity with debouncing
    const updateItemQuantity = useCallback(
        async (itemId, quantity) => {
            // 1. Lấy item hiện tại từ Ref
            const oldItem = cartItemsRef.current.find(
                (item) => getItemId(item) === itemId,
            );
            setError(null);

            if (quantity <= 0) {
                await removeItem(itemId);
                return;
            }

            // 2. Optimistic update (Cập nhật giao diện trước)
            const quantityDiff = oldItem ? quantity - oldItem.quantity : 0;

            setCartItems((prev) =>
                prev.map((item) =>
                    getItemId(item) === itemId ? { ...item, quantity } : item,
                ),
            );

            if (cart && oldItem) {
                setCart((prev) => ({
                    ...prev,
                    itemCount: Math.max(
                        0,
                        (prev.itemCount || 0) + quantityDiff,
                    ),
                }));
            }

            // 3. Clear existing timeout
            if (updateTimeoutsRef.current.has(itemId)) {
                clearTimeout(updateTimeoutsRef.current.get(itemId));
            }

            // 4. Track Request ID
            const prevReqId = requestIdRef.current.get(itemId) || 0;
            const newReqId = prevReqId + 1;
            requestIdRef.current.set(itemId, newReqId);

            // 5. Debounce API Call (Chờ 300ms mới gọi server)
            const timeoutId = setTimeout(async () => {
                try {
                    const currentCartId = cart?.id || cart?._id;
                    const diff = quantity - oldItem.quantity;

                    // [QUAN TRỌNG] Lấy variantId đúng chuẩn Adapter mới
                    const variantId =
                        oldItem.variant?._id ||
                        oldItem.variantId?._id ||
                        oldItem.variantId;

                    if (diff > 0) {
                        // Tăng số lượng -> Gọi Add
                        await apiAddItem(currentCartId, {
                            variantId,
                            quantity: diff,
                            userId: user?._id,
                        });
                    } else if (diff < 0) {
                        // Giảm số lượng -> Gọi Remove
                        await apiRemoveItem(currentCartId, {
                            variantId,
                            quantity: Math.abs(diff),
                            userId: user?._id,
                        });
                    }

                    // 6. Race Condition Check
                    if (requestIdRef.current.get(itemId) === newReqId) {
                        // Gọi fetchCart để đồng bộ lại giá tiền chuẩn từ server
                        // Vì API Add/Remove trả về Cart object, ta có thể dùng luôn nếu muốn tối ưu hơn
                        fetchCart();

                        // Clean up refs
                        updateTimeoutsRef.current.delete(itemId);
                        requestIdRef.current.delete(itemId);
                    }
                } catch (err) {
                    // Revert logic (Giữ nguyên như cũ)
                    if (requestIdRef.current.get(itemId) === newReqId) {
                        console.error('Error updating quantity:', err);
                        setError(err.message || 'Failed to update quantity');

                        if (oldItem) {
                            setCartItems((prev) =>
                                prev.map((item) =>
                                    getItemId(item) === itemId ? oldItem : item,
                                ),
                            );
                            if (cart) {
                                const revertDiff = oldItem.quantity - quantity;
                                setCart((prev) => ({
                                    ...prev,
                                    itemCount: Math.max(
                                        0,
                                        (prev.itemCount || 0) + revertDiff,
                                    ),
                                }));
                            }
                        }
                    }
                }
            }, 300);

            updateTimeoutsRef.current.set(itemId, timeoutId);
        },
        [cart, removeItem, fetchCart, user], // Thêm fetchCart vào dependency
    );

    // Clear all items from cart
    const clearAllItems = useCallback(async () => {
        const currentCartId = cart?.id || cart?._id;
        if (!currentCartId) return;

        try {
            setLoading(true);
            setError(null);

            // [CẬP NHẬT] Gửi kèm userId để Backend bắn socket thông báo
            await clearCart(currentCartId, user?._id);

            // Cập nhật UI ngay lập tức (Optimistic UI)
            setCartItems([]);
            setCart((prev) => ({ ...prev, itemCount: 0, totalPrice: 0 }));
        } catch (err) {
            setError(err.message || 'Failed to clear cart');
            console.error('Error clearing cart:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [cart, user]);

    // Delete entire cart
    const deleteCurrentCart = useCallback(async () => {
        const currentCartId = cart?.id || cart?._id;
        if (!currentCartId) return;

        try {
            setLoading(true);
            setError(null);

            await deleteCart(currentCartId);
            setCart(null);
            setCartItems([]);
        } catch (err) {
            setError(err.message || 'Failed to delete cart');
            console.error('Error deleting cart:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [cart]);

    // Calculate cart summary (memoized)
    const cartSummary = useMemo(
        () => ({
            itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
            subtotal: cartItems.reduce(
                (sum, item) => sum + item.quantity * (item.price || 0),
                0,
            ),
            total: cart?.totalPrice || 0,
            discount: cart?.discountAmount || 0,
        }),
        [cartItems, cart?.totalPrice, cart?.discountAmount],
    );

    // Clear session ID (called after login)
    const clearGuestSession = useCallback(() => {
        localStorage.removeItem('guestSessionId');
    }, []);

    return {
        cart,
        cartItems,
        loading,
        error,
        cartSummary,
        fetchCart,
        addItem,
        updateItemQuantity,
        removeItem,
        clearAllItems,
        deleteCurrentCart,
        getSessionId,
        clearGuestSession,
    };
};
