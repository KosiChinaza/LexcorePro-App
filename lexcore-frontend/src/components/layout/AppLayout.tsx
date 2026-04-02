import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 min-h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
