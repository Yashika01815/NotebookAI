import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import { useWorkspaceStore } from '../../store/index.js';
import { workspaceAPI } from '../../services/api.js';
import toast from 'react-hot-toast';

export default function DashboardLayout() {
  const { setWorkspaces, setLoading } = useWorkspaceStore();

  useEffect(() => {
    const loadWorkspaces = async () => {
      setLoading(true);
      try {
        const data = await workspaceAPI.getAll();
        setWorkspaces(data.workspaces);
      } catch (err) {
        toast.error('Failed to load workspaces');
      } finally {
        setLoading(false);
      }
    };
    loadWorkspaces();
  }, []);

  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
