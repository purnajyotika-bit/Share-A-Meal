import React, { useState } from 'react';
// React Router వాడుతుంటే useNavigate వాడండి, Next.js అయితే useRouter వాడండి
import { useNavigate, Link } from 'react-router-dom'; 

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Old errors clear చేయడానికి

    try {
      // 1. API Call - Mee Backend URL ని ఇక్కడ మార్చుకోండి
      const response = await fetch('https://share-a-meal-14.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend nunchi error వస్తే throw చేస్తుంది
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      // 2. Token and User Data checking
      if (data.token) {
        // Redirect అయ్యే ముందే LocalStorage లో సేవ్ అవ్వాలి
        localStorage.setItem('token', data.token);
        
        // User Name రావడం లేదు అన్నారు కదా, ఇక్కడ name సేవ్ అవుతుందో లేదో చూడండి
        if (data.user && data.user.name) {
          localStorage.setItem('user_name', data.user.name);
        }

        // 3. Redirect to Dashboard page
        navigate('/dashboard'); 
      } else {
        throw new Error('Authentication token missing from server response.');
      }

    } catch (err) {
      console.error("Sign In Error details:", err);
      // Screen మీద ఏం తప్పు జరిగిందో యూజర్‌కి చూపిస్తుంది
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false); // Error వస్తే loading స్టేట్ ఆగిపోవాలి
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Sign in</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Sign in to continue</p>
        </div>

        {/* ERROR MESSAGE DISPLAY */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                loading ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  {/* CSS Loading Spinner */}
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/signup" className="font-medium text-orange-600 hover:text-orange-500">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
