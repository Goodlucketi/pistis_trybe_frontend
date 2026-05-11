import { useState } from 'react';
import { User, Upload } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe, updateMe } from '../../../services/UserService';
import { useNavigate } from 'react-router-dom';

export default function EditProfileForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
  });

  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Populate form once user data loads
  if (user && !initialized) {
    setFormData({
      fullName: user.fullName || '',
      bio: user.biography || '',
    });
    setProfileImage(user.avatarUrl || null);
    setInitialized(true);
  }

  const updateMutation = useMutation({
    mutationFn: (data) => updateMe(data),
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      navigate('/dashboard/profile');
    },
    onError: (error) => {
      alert(error?.message || 'Failed to update profile. Please try again.');
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      bio: user?.biography || '',
    });
    setProfileImage(user?.avatarUrl || null);
    setImageFile(null);
    navigate('/dashboard/profile');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = new FormData();
    if (formData.fullName) data.append('fullName', formData.fullName);
    if (formData.bio !== undefined) data.append('biography', formData.bio);
    if (imageFile) data.append('file', imageFile);

    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl p-3 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        Edit your profile
      </h1>

      <form onSubmit={handleSubmit} className="space-y-1">
        {/* Profile Picture */}
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <User className="w-10 h-10" strokeWidth={1.5} />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Image
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Min 400×400px, PNG or JPEG
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium transition-colors inline-flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>

              {imageFile && (
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setProfileImage(user?.avatarUrl || null);
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Cancel Image
                </button>
              )}
            </div>
          </div>
        </div>

        <hr className="border-gray-200 my-6" />

        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
            required
          />
        </div>

        {/* Email — read only */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={user?.email || ''}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed outline-none"
            disabled
            readOnly
          />
          <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
        </div>

        {/* Biography */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Biography
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 sm:gap-4 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 sm:px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors text-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-5 sm:px-6 py-2.5 rounded-xl bg-[#401667] hover:scale-103 transition text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
