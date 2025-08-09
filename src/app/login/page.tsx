import { Metadata } from 'next'
import React from 'react'
import Login from './Login'

export const metadata: Metadata = {
  title: 'Login'
}

export default function LoginPage() {
  return (
    <Login />
  )
}
