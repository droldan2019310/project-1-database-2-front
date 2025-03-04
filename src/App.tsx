import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import LayoutRoutes from './general/LayoutRoutes';
import Product from './pages/product/Product';
import Provider from './pages/provider/Provider';
import Branch from './pages/branch/Branch';
import Invoice from './pages/invoice/Invoice';
import RouteBranch from './pages/routeBranch/RouteBranch';
import { ToastContainer } from 'react-toastify';
import Home from './pages/home/Home';

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route element={<LayoutRoutes />}>
            <Route path="/" element={<Home />} />
            <Route path="/product" element={<Product />} />
            <Route path="/provider" element={<Provider />} />
            <Route path="/branch_offices" element={<Branch />} />
            <Route path="/invoice" element={<Invoice />} />
            <Route path="/routes" element={<RouteBranch />} />
          </Route>
        </Routes>
        <ToastContainer />
      </Router>
    </>
  )
}

export default App
