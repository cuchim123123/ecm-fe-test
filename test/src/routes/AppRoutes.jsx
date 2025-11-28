import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom'; // [1] Đổi import
import Layout from '../components/Layout';
import ErrorBoundary from '../components/ErrorBoundary';
import ProtectedRoute from '../components/ProtectedRoute';
import GuestRoute from '../components/GuestRoute';
import { ROUTES } from '../config/routes';
import { LoadingSpinner } from '../components/common';

// Lazy load (Giữ nguyên)
const Home = lazy(() => import('../pages/Home'));
const Collection = lazy(() => import('../pages/Collection'));
const Products = lazy(() =>
    import('../pages/Products').then((m) => ({ default: m.Products })),
);
const ProductDetail = lazy(() =>
    import('../pages/Products').then((m) => ({ default: m.ProductDetail })),
);
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));
const Cart = lazy(() => import('../pages/Cart/index'));
const Checkout = lazy(() => import('../pages/Checkout'));
const Login = lazy(() => import('../pages/Auth/Login/Login'));
const Signup = lazy(() => import('../pages/Auth/Signup/Signup'));
const VerifyEmail = lazy(() => import('../pages/Auth/Signup/VerifyEmail'));
const PlaceOrder = lazy(() => import('../pages/PlaceOrder'));
const Orders = lazy(() => import('../pages/Orders'));
const OrderHistory = lazy(() => import('../pages/OrderHistory'));
const OrderDetail = lazy(() => import('../pages/OrderHistory/OrderDetail'));
const Payment = lazy(() => import('../pages/Payment'));
const Profile = lazy(() => import('../pages/Profile'));
const AdminPanel = lazy(() => import('../pages/AdminPanel'));
const Dashboard = lazy(() => import('../pages/AdminPanel/Dashboard'));
const Users = lazy(() => import('../pages/AdminPanel/Users'));
const AdminProducts = lazy(() => import('../pages/AdminPanel/Products'));
const AdminOrders = lazy(() => import('../pages/AdminPanel/Orders'));
const DiscountCodes = lazy(() => import('../pages/AdminPanel/DiscountCodes'));
const CarouselDemo = lazy(() => import('../pages/CarouselDemo'));

// Loading component
const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <LoadingSpinner size="lg" />
    </div>
);

const AppRoutes = () => {
    return (
        // [2] Sử dụng <Routes> thay vì RouterProvider
        <Routes>
            {/* --- GUEST ROUTES --- */}
            <Route
                path={ROUTES.LOGIN}
                element={
                    <Suspense fallback={<PageLoader />}>
                        <GuestRoute>
                            <Login />
                        </GuestRoute>
                    </Suspense>
                }
            />
            <Route
                path={ROUTES.REGISTER}
                element={
                    <Suspense fallback={<PageLoader />}>
                        <GuestRoute>
                            <Signup />
                        </GuestRoute>
                    </Suspense>
                }
            />
            <Route
                path="/verify-email"
                element={
                    <Suspense fallback={<PageLoader />}>
                        <VerifyEmail />
                    </Suspense>
                }
            />

            {/* --- ADMIN ROUTES --- */}
            <Route
                path={ROUTES.ADMIN}
                element={
                    <Suspense fallback={<PageLoader />}>
                        <ProtectedRoute adminOnly={true}>
                            <AdminPanel />
                        </ProtectedRoute>
                    </Suspense>
                }
            >
                {/* Nested Admin Routes */}
                <Route
                    index
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <Dashboard />
                        </Suspense>
                    }
                />
                <Route
                    path="users"
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <Users />
                        </Suspense>
                    }
                />
                <Route
                    path="products"
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <AdminProducts />
                        </Suspense>
                    }
                />
                <Route
                    path="orders"
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <AdminOrders />
                        </Suspense>
                    }
                />
                <Route
                    path="discount-codes"
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <DiscountCodes />
                        </Suspense>
                    }
                />
            </Route>

            {/* --- MAIN APP ROUTES (With Layout) --- */}
            <Route element={<Layout />} errorElement={<ErrorBoundary />}>
                <Route
                    path={ROUTES.HOME}
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <Home />
                        </Suspense>
                    }
                />
                <Route
                    path={ROUTES.COLLECTION}
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <Collection />
                        </Suspense>
                    }
                />
                <Route
                    path={ROUTES.PRODUCTS}
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <Products />
                        </Suspense>
                    }
                />
                <Route
                    path={ROUTES.PRODUCT_DETAIL}
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <ProductDetail />
                        </Suspense>
                    }
                />
                <Route
                    path={ROUTES.ABOUT}
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <About />
                        </Suspense>
                    }
                />
                <Route
                    path={ROUTES.CONTACT}
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <Contact />
                        </Suspense>
                    }
                />
                <Route
                    path={ROUTES.CART}
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <Cart />
                        </Suspense>
                    }
                />
                <Route
                    path={ROUTES.CHECKOUT}
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <Checkout />
                        </Suspense>
                    }
                />
                <Route
                    path={ROUTES.PLACE_ORDER}
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <PlaceOrder />
                        </Suspense>
                    }
                />
                <Route
                    path={ROUTES.PAYMENT}
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <Payment />
                        </Suspense>
                    }
                />
                <Route
                    path={ROUTES.ORDERS}
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <Orders />
                        </Suspense>
                    }
                />
                <Route
                    path={ROUTES.ORDER_HISTORY}
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <OrderHistory />
                        </Suspense>
                    }
                />
                <Route
                    path={`${ROUTES.ORDER_HISTORY}/:orderId`}
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <OrderDetail />
                        </Suspense>
                    }
                />
                <Route
                    path={ROUTES.PROFILE}
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <Profile />
                        </Suspense>
                    }
                />
                <Route
                    path="/carousel-demo"
                    element={
                        <Suspense fallback={<PageLoader />}>
                            <CarouselDemo />
                        </Suspense>
                    }
                />
            </Route>
        </Routes>
    );
};

export default AppRoutes;