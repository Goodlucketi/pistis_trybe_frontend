import SettingsComponent from '../../../community/components/profile/Settings'; 

export default function Settings() {
  return (
    <div className="relative sticky top-30">

      {/* SCROLLABLE CENTER CONTENT */}
      <div
        className="
          bg-white shadow border border-[#E8E8E8] rounded-2xl">
        <div className="space-y-8 p-3 ">
          <SettingsComponent />
        </div>
      </div>

    </div>
  );
}