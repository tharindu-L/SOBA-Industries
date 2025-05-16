import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import CashierAuth from './components/CashierAuth';
import CashierDashboard from './components/CashierDashboard';

const App = () => {
  return (
    <Router>
      <div className="container-fluid">
        <div className="row">
        
          <div className="col-md-9 main-content">
            <Routes>
            
              <Route path="/" element={<CashierAuth/>} />
              <Route path="/cashier-dashboard" element={<CashierDashboard/>} />
                        </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
