
const ActivityTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-4 sm:py-5 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your Activity</h2>
      </div>

      <div className="flex gap-2 sm:gap-0 rounded-2xl p-1">
        <button
          type="button"
          onClick={() => onTabChange('feed')}
          className={`flex-1 sm:flex-none px-4 sm:px-9 py-2.5 rounded-xl text-sm font-medium hover:cursor-pointer transition-all duration-200 ${
            activeTab === 'feed'
              ? 'bg-[#FDFDFD] shadow-sm border border-gray-300 text-gray-900'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          Feed
        </button>

        <button
          type="button"
          onClick={() => onTabChange('members')}
          className={`flex-1 sm:flex-none px-4 sm:px-9 py-2.5 rounded-xl hover:cursor-pointer text-sm font-medium transition-all duration-200 ${
            activeTab === 'members'
              ? 'bg-white shadow-sm border border-gray-300 text-gray-900'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          Members
        </button>
      </div>
    </div>
  );
};

export default ActivityTabs;