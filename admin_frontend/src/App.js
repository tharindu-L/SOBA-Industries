import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AdminInvoices from './components/AdminInvoices';
import CustomOrderList from './components/CustomOrderList';
import Dashboard from './components/Chart';
import InvoiceList from './components/InvoiceList';
import OrderList from './components/OrderList';
import Sidebar from './components/Sidebar';

const App = () => {
  return (
    <Router>
      <div className="container-fluid">
        <div className="row">
          <Sidebar />
          <div className="col-md-9 main-content">
            <Routes>
            
              <Route path="/invoices" element={<AdminInvoices />} />
              <Route path="/c-orders" element={<CustomOrderList />} />
              <Route path='/orders' element={<OrderList/>}/>
              <Route path="/bills" element={<InvoiceList />} />
               <Route path="/dashboard" element={<Dashboard/>} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
