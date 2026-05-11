import Communities from "../groups/communities/Communities";
import DailyDevotional from "./Devotional";
// import JoinGroups from "./JoinGroups";

const RightPanel = () => {
  return (
    <aside className="w-80 flex flex-col gap-4 sticky top-25 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto">
      <DailyDevotional />
      {/* <JoinGroups /> */}
      <Communities variant="sidebar" />
    </aside>
  );
};

export default RightPanel;