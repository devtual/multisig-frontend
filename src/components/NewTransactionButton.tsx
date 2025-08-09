import { Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function NewTransactionButton() {
    return (
        <Link
            href="/transactions/new"
            className="bg-primary-500 hover:bg-primary-500/80 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
            <Plus className="h-4 w-4 mr-2" />
            New Transaction
        </Link>
    )
}
