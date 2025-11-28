import React, { useEffect } from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import { Toaster } from './ui/sonner';
import { initSocket, disconnectSocket } from '../services/socket';
import { useAuth } from '../hooks/useAuth';

const Layout = () => {
    const { user } = useAuth();

    useEffect(() => {
        if (user && user._id) {
            initSocket(user._id);
        }
        return () => {
            disconnectSocket();
        }
    }, [user]);

    return (
        <div className='overflow-x-hidden w-full'>
            <Navbar />
            <main className='w-full relative pt-[73px]'>
                <Outlet />
            </main>
            <Toaster />
        </div>
    )
}

export default Layout;