
import React, { useState } from 'react';

interface ForgotPasswordFormProps {
  onNavigateToSentScreen: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onNavigateToSentScreen }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would trigger the password reset API call here.
    onNavigateToSentScreen();
  };

  return (
    <div className="flex flex-col justify-between flex-grow pt-16">
        <div>
            <h1 className="text-4xl font-medium text-brand-primary mb-4">Forgot Password</h1>
            <p className="text-brand-secondary mb-12">Enter your email address and we'll send you a link to reset your password.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email-forgot-password" className="text-sm text-brand-secondary">Email</label>
                    <input
                        id="email-forgot-password"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-4 mt-1 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                        aria-label="Email"
                        required
                    />
                </div>
            </form>
        </div>

        <div className="mt-8 pb-4">
            <button onClick={handleSubmit} className="w-full py-5 bg-brand-dark text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors">
                Send Reset Link
            </button>
        </div>
    </div>
  );
};

export default ForgotPasswordForm;
