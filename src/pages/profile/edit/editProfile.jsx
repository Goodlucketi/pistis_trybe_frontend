// src/pages/profile/EditProfile.tsx
import EditProfileForm from '../../../community/components/profile/EditProfileForm'; 

export default function EditProfile() {
  return (
    <div className="relative sticky top-30">

      {/* SCROLLABLE CENTER CONTENT */}
      <div
        className="
          bg-white shadow border border-[#E8E8E8] rounded-2xl">
        <div className="p-2">
          {/* Pass in user Object when using real data */}
          <EditProfileForm />
        </div>
      </div>
  
    </div>
  );
}