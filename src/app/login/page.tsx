// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';  // Import useRouter for redirection
import { Eye, EyeOff } from "lucide-react";  // show password

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // show password
  const [error, setError] = useState('');
  const router = useRouter();  // Initialize router for redirection

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Send login request to the API
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      if (data.role === 'Admin'){
        router.push('/admin/product-management');
      } else if (data.role ==='Product Manager'){
        router.push('/productManager');
      } else if (data.role === 'Stakeholders'){
        router.push('/stakeholder');
      }else {
        setError('Invalid user role');
      }
    } else {
      // Display the error message if login fails
      setError(data.message || 'Login failed');
    }
    console.log(error);
  };

  return (
    <div className="min-h-screen bg-[#E5E7F3] flex items-center justify-center p-4">
      <div className="bg-[#F5F5F5] rounded-3xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-center text-2xl font-bold text-primary mb-6">MVP TRACKER</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="loginId" className="block text-sm font-bold text-gray-700">
              Login ID
            </label>
            <input
              type="text"
              id="loginId"
              name="loginId"
              placeholder="Enter your ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
            />
          </div>
          <label htmlFor="password" className="block text-sm font-bold text-gray-700">
              Password
            </label>
          <div className="relative">
            <input
              type= {showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
            />
            <button 
            type='button'
            className='absolute inset-y-0 text-gray-700 right-3 flex items-center'
            onMouseDown={() => setShowPassword(true)}
            onMouseUp={() => setShowPassword(false)}
            onMouseLeave={() => setShowPassword(false)}
            >
              {showPassword ? <EyeOff size={20}/> : <Eye size={20} />}
            </button>
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-md py-2 text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}