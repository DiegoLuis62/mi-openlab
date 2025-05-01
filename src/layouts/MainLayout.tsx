import {ReactNode} from 'react';
import Navbar from '../components/Navbar';

export default function MainLayout({children}: {children: ReactNode}) {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-white">
          <Navbar />
          <main className="p-4">{children}</main>
        </div>
      );
}