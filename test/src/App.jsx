import AppRoutes from './routes/AppRoutes';
import { Toaster } from './components/ui/sonner';
import { CartProvider } from './context/CartContext';
import './App.css';

const App = () => {
  return (
      // AuthProvider đã có ở main.jsx nên ở đây không cần nữa
      // Router đã có ở main.jsx nên ở đây cũng không cần
      
      <CartProvider> 
          <Toaster />
          <AppRoutes />
      </CartProvider>
  );
}

export default App;