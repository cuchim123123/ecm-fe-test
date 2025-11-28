import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // [1] THÊM IMPORT
import './index.css';
import App from './App.jsx';
// import AppRoutes from './routes/AppRoutes'; // [2] XÓA DÒNG NÀY (Dư thừa, App.jsx đã dùng rồi)
import { AuthProvider } from './hooks/useAuth'; 
import { initAPIPreconnect } from './utils/prefetch';
import { initPerformanceTracking } from './utils/performance';

initAPIPreconnect();
initPerformanceTracking();

// Facebook đôi khi append "#_=_" vào redirect → loại bỏ để tránh hash lạ
if (window.location.hash === '#_=_') {
  const cleanUrl = window.location.href.replace(/#_=_$/, '');
  window.history.replaceState({}, document.title, cleanUrl);
}

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

async function enableMocking() {
    if (!USE_MOCK_DATA) return;
    const { worker } = await import('./mocks');
    return worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
    createRoot(document.getElementById('root')).render(
        // [3] BỌC BROWSER ROUTER Ở NGOÀI CÙNG
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    );
});