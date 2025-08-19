"use client"
import Link from 'next/link'
import React from 'react'
import { Wallet, FileText, Home, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import logo from "../../public/logo.svg"
import Image from 'next/image';
import { useWallet } from '@/context/WalletContext';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/transactions', icon: FileText, label: 'Transactions' },
  { path: '/fund', icon: Wallet, label: 'Fund' },
  { path: '/submit-request', icon: User, label: 'Submit Request'}
  // { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Header() {
  const {isDeployer} = useWallet();
  const pathname = usePathname();
  const { data: session } = useSession()

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex gap-2 items-center">
            <Image src={logo} width="30" height="30" alt='logo' />
            <h1 className="text-xl font-bold">Tresis</h1>
          </div>

          {session?.address && <div className="flex space-x-8 items-center">
            {navItems.map((item) => {
              if (item.label === "Fund" && !isDeployer)
                return;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === item.path
                      ? 'text-white hover:text-primary-500'
                      : 'text-gray-300 hover:text-primary-500'
                    }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              )
            })}
            <button
              className="bg-red-500 text-sm text-white px-4 py-2 rounded cursor-pointer"
              onClick={() => signOut()}>
              Log Out
            </button>
          </div>}
        </div>
      </div>
    </nav>
  )
}
