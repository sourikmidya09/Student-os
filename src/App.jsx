import { Toaster } from 'react-hot-toast';
import { AppProvider } from './store/AppContext';
import Layout from './components/layout/Layout';
import './styles/globals.css';

export default function App() {
  return (
    <AppProvider>
      <Layout />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: '13px',
            fontFamily: '"DM Sans", system-ui, sans-serif',
            borderRadius: '12px',
            padding: '10px 14px',
          },
        }}
      />
    </AppProvider>
  );
}