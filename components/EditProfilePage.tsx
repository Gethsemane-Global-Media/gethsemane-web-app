import React, { useState } from 'react';
import { useUserProfile, UserProfile } from '../hooks/useUserProfile';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface EditProfilePageProps {
  onNavigateBack: () => void;
}

const EditProfilePage: React.FC<EditProfilePageProps> = ({ onNavigateBack }) => {
  const [profile, updateProfile] = useUserProfile();
  const [formData, setFormData] = useState<UserProfile>(profile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateProfile(formData);
    onNavigateBack();
  };

  return (
    <div className="flex-grow p-6 flex flex-col">
        <header className="flex items-center h-16 shrink-0">
            <button onClick={onNavigateBack} className="text-brand-primary p-2 -ml-2">
                <ArrowLeftIcon />
            </button>
            <div className="flex items-center ml-2">
                <span className="h-8 w-px bg-green-700 mr-2"></span>
                <span className="text-2xl font-medium tracking-wider text-brand-primary">GSOM</span>
            </div>
      </header>
      
      <main className="flex-grow flex flex-col">
        <h1 className="text-4xl font-medium text-brand-primary">Edit Profile</h1>
        
        <section className="flex flex-col items-center text-center mt-8">
            <div className="w-28 h-28 rounded-full bg-gray-300 bg-cover bg-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" }}></div>
        </section>

        <section className="mt-12 space-y-6">
            <div>
                <label htmlFor="name" className="text-sm text-brand-secondary">Full name</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-4 mt-1 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    aria-label="Full name"
                />
            </div>
            <div>
                <label htmlFor="role" className="text-sm text-brand-secondary">Role</label>
                <input
                    id="role"
                    name="role"
                    type="text"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-4 mt-1 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    aria-label="Role"
                />
            </div>
        </section>
        
        <section className="mt-auto pb-8">
            <button onClick={handleSave} className="w-full py-5 bg-brand-dark text-white rounded-full font-semibold text-lg hover:bg-opacity-90 transition-colors">
                Save Changes
            </button>
        </section>
      </main>
    </div>
  );
};

export default EditProfilePage;