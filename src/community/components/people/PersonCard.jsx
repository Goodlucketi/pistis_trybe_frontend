import { useNavigate } from "react-router-dom";
import FollowButton from "./FollowButton";

const PersonCard = ({ person, onFollowChange }) => {
  const navigate = useNavigate();
  const initial = person.fullName?.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      onClick={() => navigate(`/dashboard/users/${person._id}`)}
      className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-white border border-gray-200 cursor-pointer transition hover:border-purple-300"
    >
      {person.avatarUrl ? (
        <img src={person.avatarUrl} alt={person.fullName} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#401667] flex items-center justify-center shrink-0">
          <span className="text-white font-semibold">{initial}</span>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-gray-900 truncate">{person.fullName}</p>
          {person.followsYou && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">Follows you</span>
          )}
        </div>
        {person.biography ? (
          <p className="text-sm text-gray-500 line-clamp-1">{person.biography}</p>
        ) : null}
        <p className="text-xs text-gray-400 mt-0.5">
          {person.followersCount} followers · {person.followingCount} following
        </p>
      </div>

      <FollowButton
        userId={person._id}
        isFollowing={person.isFollowing}
        followsYou={person.followsYou}
        onChange={(following) => onFollowChange?.(person._id, following)}
      />
    </div>
  );
};

export default PersonCard;
