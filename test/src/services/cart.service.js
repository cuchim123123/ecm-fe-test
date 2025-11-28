import apiClient from './config';

/**
 * Cart Service Frontend
 * Đã cập nhật khớp với cart.route.js (Backend)
 */

// 1. Lấy danh sách giỏ hàng (Admin)
// Route: GET /
export const getAllCarts = async () => {
    return await apiClient.get('/carts');
};

// 2. Lấy giỏ hàng theo User ID
// Route: GET /user/:userId
export const getCartByUser = async (userId) => {
    return await apiClient.get(`/carts/user/${userId}`);
};

// 3. Lấy giỏ hàng theo Session ID
// Route: GET /session/:sessionId
export const getCartBySession = async (sessionId) => {
    return await apiClient.get(`/carts/session/${sessionId}`);
};

// 4. Tạo giỏ hàng mới
// Route: POST /
export const createCart = async (cartData) => {
    return await apiClient.post('/carts', cartData);
};

// 5. Xóa sạch giỏ hàng
// Route: DELETE /:cartId/clear
export const clearCart = async (cartId, userId = null) => {
    // Gửi userId trong body để Backend bắn socket (nếu cần)
    const config = userId ? { data: { userId } } : {};
    return await apiClient.delete(`/carts/${cartId}/clear`, config);
};

// 6. Xóa vĩnh viễn giỏ hàng (Admin)
// Route: DELETE /:cartId
export const deleteCart = async (cartId) => {
    return await apiClient.delete(`/carts/${cartId}`);
};

// ============================================================
// CÁC HÀM THAO TÁC ITEM (QUAN TRỌNG)
// ============================================================

/**
 * Thêm sản phẩm (Thay thế cho createCartItem cũ)
 * Route: POST /:cartId/items
 * Payload: { variantId, quantity, userId? }
 */
export const addItem = async (cartId, data) => {
    return await apiClient.post(`/carts/${cartId}/items`, data);
};

/**
 * Giảm số lượng hoặc Xóa 1 sản phẩm (Thay thế cho deleteCartItem cũ)
 * Route: POST /:cartId/remove-item
 * Payload: { variantId, quantity, userId? }
 */
export const removeItem = async (cartId, data) => {
    return await apiClient.post(`/carts/${cartId}/remove-item`, data);
};

// Export mặc định
export default {
    getAllCarts,
    getCartByUser,
    getCartBySession,
    createCart,
    clearCart,
    deleteCart,
    addItem,
    removeItem,
};
