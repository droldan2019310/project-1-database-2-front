import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css'
import 'react-toastify/dist/ReactToastify.css';
import 'reactflow/dist/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import LayoutRoutes from './general/LayoutRoutes';
import Product from './pages/product/Product';
import { ToastContainer } from 'react-toastify';
import Home from './pages/home/Home';
import ProviderGraph from './pages/provider/Provider';
import BranchOfficeGraph from './pages/branch/Branch';
import InvoiceGraph from './pages/invoice/Invoice';
import RouteGraph from './pages/routeBranch/RouteBranch';

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route element={<LayoutRoutes />}>
            <Route path="/" element={<Home />} />
            <Route path="/product" element={<Product />} />
            <Route path="/provider" element={<ProviderGraph />} />
            <Route path="/branch_offices" element={<BranchOfficeGraph />} />
            <Route path="/invoice" element={<InvoiceGraph />} />
            <Route path="/routes" element={<RouteGraph />} />
          </Route>
        </Routes>
        <ToastContainer />
      </Router>
    </>
  )
}

export default App
