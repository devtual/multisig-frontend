"use client"
import { BadgeCheck, CircleAlert, Info, TriangleAlert } from 'lucide-react';
import React from 'react'
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import 'react-toastify/dist/ReactToastify.css';

function CustomToastContainer() {
  return (
        <ToastContainer
        className="text-sm"
        icon={({ type }) => {
          switch (type) {
            case 'info':
              return <Info className="stroke-indigo-400" />;
            case 'error':
              return <CircleAlert className="stroke-red-600" />;
            case 'success':
              return <BadgeCheck className="stroke-green-600" />;
            case 'warning':
              return <TriangleAlert className="stroke-yellow-600" />;
            default:
              return null;
          }
        }}
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

  )
}

export default CustomToastContainer