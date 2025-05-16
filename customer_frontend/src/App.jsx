import { Route, Routes, useLocation } from 'react-router-dom';

import Cart from './componts/Cart/Cart';
import CustomNavbar from './componts/Navbar/Navbar';
import Dashboard from './pages/Dashboard';
import Footer from './componts/Footer/Footer';
import Footprints from './componts/Footprints/Footprints';
import Header from './componts/Header/Header';
import JobsByUser from './pages/Bill';
import OrdersComponent from './pages/OrdersComponent';
import ProfilePage from './pages/ProfilePage';
import Quotations from './pages/Quotations';
import React from 'react';
import ShopItems from './componts/ShopItems/ShopItems';
import Sidebar from './componts/Sidebar/Sidebar';
import Testimonial from './componts/Testimonial/Testimonial';
import UserInvoices from './pages/UserInvoices';
import { assest } from './assest/assest';

const App = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isProfilePage = location.pathname === '/profile';
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  return (
    <div
      className="App"
      style={{
        backgroundImage: `url(${assest.H5})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Navbar and Footer for Home and Profile pages only */}
      {(isHomePage || isProfilePage) && <CustomNavbar isHomePage={isHomePage} />}

      {isHomePage && (
        <>
          <Header />
          <ShopItems />
          <Footprints />
 
        </>
      )}

      {/* Sidebar for Dashboard routes */}
      {isDashboardRoute && <Sidebar />}

      {/* Main Content Area */}
      <div style={{ marginLeft: isDashboardRoute ? '240px' : '0', padding: '20px' }}>
        <Routes>
          <Route path="/" element={<CustomNavbar isHomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/create-new-Custom-Order" element={<Quotations />} />
          <Route path="/dashboard/invoices" element={<UserInvoices />} />
          <Route path="/dashboard/bills" element={<JobsByUser />} />
           <Route path="/orders" element={<OrdersComponent />} />
           <Route path="/cart" element={<Cart />} />
        
        </Routes>
      </div>

      {/* Footer only on Home and Profile pages */}
      {(isHomePage || isProfilePage) && <Footer />}
    </div>
  );
};

export default App;
