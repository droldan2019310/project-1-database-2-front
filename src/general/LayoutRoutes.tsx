import {  Outlet } from 'react-router-dom';
import Layout from './Layout';


const LayoutRoutes: React.FC = () => {

    return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default LayoutRoutes;