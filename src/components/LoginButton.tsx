"use client"

import { logInWithEthereum } from "@/lib/siwe-client"
import { useSession, signOut } from "next-auth/react"

export default function LoginButton() {
  const { data: session } = useSession()

  return (
    <main className="p-6">
      {!session?.address ? (
        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={logInWithEthereum}
        >
          Sign In with Ethereum
        </button>
      ) : (
        <>
          <p className="mb-4">Signed in as {session.address}</p>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => signOut()}
          >
            Sign Out
          </button>
        </>
      )}
    </main>
  )
}
