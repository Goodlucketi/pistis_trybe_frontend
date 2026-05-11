import { useState, useMemo } from "react";
import CommunityCard from "../CommunityCard";
import communitiesData from "../../../store/data/communities.json";
import { Link } from "react-router-dom";
import clsx from "clsx";

const Communities = ({ variant = "sidebar", currentUserId = 1 }) => {
  const [communities] = useState(communitiesData);
  const [joinedIds, setJoinedIds] = useState([1, 3]); // Mock: user is in groups 1 and 3

  const handleJoin = (id) => {
    setJoinedIds((prev) =>
      prev.includes(id)? prev.filter((i) => i!== id) : [...prev, id]
    );
  };

  const getUserRole = (community) => {
    const member = community.members?.find(m => m.id === currentUserId);
    if (!member) return "non-member";
    return member.role;
  };

  const isFeedView = variant === "feed";

  // Split into two lists
  const { yourGroups, suggestedGroups } = useMemo(() => {
    const your = [];
    const suggested = [];
    
    communities.forEach(community => {
      const role = getUserRole(community);
      if (role!== "non-member") {
        your.push(community);
      } else {
        suggested.push(community);
      }
    });
    
    return { yourGroups: your, suggestedGroups: suggested };
  }, [communities, joinedIds, currentUserId]);

  const renderSection = (title, groups, emptyText) => {
    if (groups.length === 0 &&!isFeedView) return null;
    
    return (
      <div className="space-y-4">
        <h2 className={clsx(
          "font-semibold text-gray-800",
          isFeedView? "text-xl" : "text-md"
        )}>
          {title}
        </h2>
        
        {groups.length === 0? (
          <p className="text-gray-500 text-sm py-8 text-center">{emptyText}</p>
        ) : (
          <div className={clsx(
            isFeedView
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "flex flex-col gap-6"
          )}>
            {groups.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                userRole={getUserRole(community)}
                onJoin={() => handleJoin(community.id)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={clsx(
      "space-y-8",
      variant === "sidebar" && "mt-6 sticky top-20 overflow-auto"
    )}>
          {/* Header for sidebar view */}
      {!isFeedView && (
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-lg">Groups</h1>
          <Link
            to="/dashboard/groups"
            className="text-sm text-[#401667] underline hover:underline"
          >
            See All
          </Link>
        </div>
      )}

      {/* Your Groups Section */}
      {renderSection(
        "Groups You Belong To", 
        yourGroups, 
        "You haven't joined any groups yet"
      )}

      {/* Divider */}
      {yourGroups.length > 0 && suggestedGroups.length > 0 && (
        <hr className="border-gray-200" />
      )}

      {/* Suggested Groups Section */}
      {renderSection(
        isFeedView? "Other Groups" : "Groups you can join",
        suggestedGroups,
        "No suggested groups right now"
      )}
    </div>
  );
};

export default Communities;