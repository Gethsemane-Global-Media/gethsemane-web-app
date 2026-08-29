import React, { useState, useEffect, useRef } from 'react';
import { useUserProfile, UserProfile } from '../hooks/useUserProfile';
import { useAuth } from '../context/AuthContext';
import { uploadUserAvatarApi } from '../services/authService';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { CameraIcon } from './icons/CameraIcon';

interface EditProfilePageProps {
  onNavigateBack: () => void;
}

const EditProfilePage: React.FC<EditProfilePageProps> = ({ onNavigateBack }) => {
  const [profile, updateProfile] = useUserProfile();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<UserProfile>({
    ...profile,
    name: user?.name || profile.name,
    role: user?.role || profile.role,
    avatarUrl: user?.avatarUrl || profile.avatarUrl,
    email: user?.email || profile.email,
  });

  useEffect(() => {
    setFormData({
      ...profile,
      name: user?.name || profile.name,
      role: user?.role || profile.role,
      avatarUrl: user?.avatarUrl || profile.avatarUrl,
      email: user?.email || profile.email,
    });
  }, [profile, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [selectedBlob, setSelectedBlob] = useState<Blob | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verify image mime type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Canvas compression to 512x512 max to prevent storage bloat
        const canvas = document.createElement('canvas');
        const MAX_DIM = 512;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormData(prev => ({ ...prev, avatarUrl: compressedDataUrl }));

          // Convert to blob for backend multipart upload
          canvas.toBlob(
            (blob) => {
              if (blob) {
                setSelectedBlob(blob);
              }
            },
            'image/jpeg',
            0.85
          );
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsUploading(true);
    let finalAvatarUrl = formData.avatarUrl;

    try {
      if (user?.id && selectedBlob) {
        try {
          finalAvatarUrl = await uploadUserAvatarApi(user.id, selectedBlob);
        } catch (apiError) {
          console.warn('Backend avatar upload skipped or failed, using local avatar:', apiError);
        }
      }
    } finally {
      setIsUploading(false);
    }

    const updatedFormData = { ...formData, avatarUrl: finalAvatarUrl };
    updateProfile(updatedFormData);

    if (user) {
      updateUser({
        ...user,
        name: updatedFormData.name,
        role: updatedFormData.role,
        avatarUrl: updatedFormData.avatarUrl,
      });
    }
    onNavigateBack();
  };

  return (
    <div className="flex-grow p-6 flex flex-col min-h-screen bg-brand-bg">
      <header className="flex items-center h-16 shrink-0">
        <button
          onClick={onNavigateBack}
          className="text-brand-primary p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeftIcon />
        </button>
      </header>

      <main className="flex-grow flex flex-col pb-24">
        <h1 className="text-4xl font-medium text-brand-primary">Edit Profile</h1>

        {/* Profile Avatar Upload Section */}
        <section className="flex flex-col items-center text-center mt-8">
          <div className="relative group cursor-pointer" onClick={handleImageClick}>
            <div
              className="w-28 h-28 rounded-full bg-gray-300 bg-cover bg-center border-4 border-white shadow-md transition-transform group-hover:scale-105"
              style={{ backgroundImage: `url('${formData.avatarUrl || profile.avatarUrl}')` }}
              role="img"
              aria-label="User avatar"
            />
            {/* Camera badge overlay */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleImageClick();
              }}
              className="absolute bottom-0 right-0 w-9 h-9 bg-brand-dark text-white rounded-full flex items-center justify-center border-2 border-white shadow-md hover:bg-brand-accent transition-colors cursor-pointer"
              aria-label="Upload new profile image"
              title="Change photo"
            >
              <CameraIcon size={16} />
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            accept="image/*"
            className="hidden"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={handleImageClick}
            className="mt-3 text-xs font-semibold text-brand-accent hover:underline cursor-pointer"
          >
            Change photo
          </button>
        </section>

        <section className="mt-10 space-y-6">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-brand-dark">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-4 mt-1 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent text-brand-dark font-medium"
              aria-label="Full name"
            />
          </div>
          <div>
            <label htmlFor="role" className="text-sm font-medium text-brand-dark">Role</label>
            <input
              id="role"
              name="role"
              type="text"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-4 mt-1 bg-white rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent text-brand-dark font-medium"
              aria-label="Role"
            />
          </div>
        </section>

        <section className="mt-auto pt-10">
          <button
            onClick={handleSave}
            className="w-full py-4 bg-brand-dark text-white rounded-full font-semibold text-base hover:bg-opacity-90 transition-colors shadow-md cursor-pointer"
          >
            Save Changes
          </button>
        </section>
      </main>
    </div>
  );
};

export default EditProfilePage;