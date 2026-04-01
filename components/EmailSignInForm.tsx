
import React, { useState } from 'react';
import { GoogleIcon } from './icons/GoogleIcon';

interface EmailSignInFormProps {
  onNavigateToSignUp: () => void;
  onSignInSuccess: () => void;
  onNavigateToForgotPassword: () => void;
}

const EmailSignInForm: React.FC<EmailSignInFormProps> = ({ onNavigateToSignUp, onSignInSuccess, onNavigateToForgotPassword }) => {
  const [email, setEmail] = useState('johndoe@gmail.com');
  const [password, setPassword] = useState('');

  return (
    <div className="flex flex-col justify-between flex-grow pt-16">
        <div>
            <h1 className="text-4xl font-medium text-brand-primary mb-12">Sign in</h1>
            <div className="space-y-6">
                <div>
                    <label htmlFor="email-signin" className="text-sm text-brand-secondary">Email</label>
                    <input
                        id="email-signin"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-4 mt-1 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        aria-label="Email"
                    />
                </div>
                <div>
                    <label htmlFor="password-signin" className="text-sm text-brand-secondary">Password</label>
                    <input
                        id="password-signin"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 mt-1 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        aria-label="Password"
                    />
                    <div className="text-right mt-2">
                        <button onClick={onNavigateToForgotPassword} className="text-sm font-semibold text-brand-accent hover:underline">
                            Forgot password?
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-center my-8 text-brand-secondary text-sm">or</div>

            <button className="w-full flex items-center justify-center gap-3 py-4 bg-white rounded-2xl border border-gray-200 text-brand-primary font-medium hover:bg-gray-50 transition-colors">
                <GoogleIcon />
                Sign in with Google
            </button>
        </div>

        <div className="mt-8">
            <button onClick={onSignInSuccess} className="w-full py-5 bg-brand-dark text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors">
                Sign in
            </button>
            <p className="text-center mt-6 text-brand-secondary">
                No account?{' '}
                <button onClick={onNavigateToSignUp} className="font-semibold text-brand-accent hover:underline">
                Sign up
                </button>
            </p>
        </div>
    </div>
  );
};

export default EmailSignInForm;