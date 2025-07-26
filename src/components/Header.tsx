import Link from 'next/link'
import React from 'react'
import { Wallet, Shield, FileText, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/transactions', icon: FileText, label: 'Transactions' },
    { path: '/contract-funding', icon: Wallet, label: 'Fund' },
    // { path: '/settings', icon: Settings, label: 'Settings' },
  ];

export default function Header({isDeployer}: {isDeployer: boolean}) {
    const pathname = usePathname();
  return (
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-500 mr-3" />
              <h1 className="text-xl font-bold">MultiWallet</h1>
            </div>
            
            <div className="flex space-x-8">
              {navItems.map((item) => {
                if(item.label === "Fund" && !isDeployer)
                  return;
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.path
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                )})}
              
            </div>
          </div>
        </div>
      </nav>
  )
}
