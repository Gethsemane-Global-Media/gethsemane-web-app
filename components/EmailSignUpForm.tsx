
import React, { useState } from 'react';
import { GoogleIcon } from './icons/GoogleIcon';

interface EmailSignUpFormProps {
  onNavigateToSignIn: () => void;
  onNavigateToSuccess: () => void;
}

const EmailSignUpForm: React.FC<EmailSignUpFormProps> = ({ onNavigateToSignIn, onNavigateToSuccess }) => {
  const [email, setEmail] = useState('johndoe@gmail.com');
  const [fullName, setFullName] = useState('John Doe');
  const [password, setPassword] = useState('');

  const handleSignUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // In a real app, you would handle form validation and API calls here.
    onNavigateToSuccess();
  };
  
  return (
    <div className="flex flex-col justify-between flex-grow pt-16">
        <div>
            <h1 className="text-4xl font-medium text-brand-primary mb-12">Sign up</h1>
            <div className="space-y-6">
                <div>
                    <label htmlFor="fullname-signup" className="text-sm text-brand-secondary">Full name</label>
                    <input
                        id="fullname-signup"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-4 mt-1 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        aria-label="Full name"
                    />
                </div>
                <div>
                    <label htmlFor="email-signup" className="text-sm text-brand-secondary">Email</label>
                    <input
                        id="email-signup"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-4 mt-1 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        aria-label="Email"
                    />
                </div>
                <div>
                    <label htmlFor="password-signup" className="text-sm text-brand-secondary">Password</label>
                    <input
                        id="password-signup"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 mt-1 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        aria-label="Password"
                    />
                </div>
            </div>

            <div className="text-center my-8 text-brand-secondary text-sm">or</div>

            <button className="w-full flex items-center justify-center gap-3 py-4 bg-white rounded-2xl border border-gray-200 text-brand-primary font-medium hover:bg-gray-50 transition-colors">
                <GoogleIcon />
                Sign up with Google
            </button>
        </div>

        <div className="mt-8">
            <button onClick={handleSignUp} className="w-full py-5 bg-brand-dark text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors">
                Sign up
            </button>
            <p className="text-center mt-6 text-brand-secondary">
                Have an account?{' '}
                <button onClick={onNavigateToSignIn} className="font-semibold text-brand-accent hover:underline">
                Sign in
                </button>
            </p>
        </div>
    </div>
  );
};

export default EmailSignUpForm;
