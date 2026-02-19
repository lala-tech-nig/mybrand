'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWrapper() {
    const pathname = usePathname();

    // Hide Navbar on dashboard pages and specific auth pages if needed
    // The requirement is specifically to remove it from dashboard
    if (pathname.startsWith('/dashboard')) {
        return null;
    }

    return <Navbar />;
}
