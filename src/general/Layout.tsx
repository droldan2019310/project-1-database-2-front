import * as React from 'react';
import Navbar from './Navbar';
import MySidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);


  return (
    <div style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
        <MySidebar />
        <div className='w-100 h-100' style={{
                flexGrow: 1,
                transition: 'margin-left 0.3s',
                overflowX:'hidden'
                }}>
            <main>
                <Navbar />
                <div style={{ padding: '16px' }}>{children}</div>
            </main>
        </div>
    </div>
  );
};

export default Layout;