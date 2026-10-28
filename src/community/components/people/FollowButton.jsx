import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import clsx from "clsx";
import { toggleFollow } from "../../../services/UserService";
import getErrorMessage from "../../../hooks/useErrorToast";

const FollowButton = ({ userId, isFollowing, followsYou, onChange, className }) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => toggleFollow(userId),
    onSuccess: (result) => {
      onChange?.(result.following);
      ["user", "people", "followers", "following", "feed"].forEach((key) =>
        queryClient.invalidateQueries({ queryKey: [key] })
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const label = mutation.isPending ? "..." : isFollowing ? "Following" : followsYou ? "Follow back" : "Follow";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        mutation.mutate();
      }}
      disabled={mutation.isPending}
      className={clsx(
        "px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50 shrink-0",
        isFollowing
          ? "border border-gray-300 text-gray-600 hover:text-red-500 hover:border-red-300"
          : "bg-[#401667] text-white",
        className
      )}
    >
      {label}
    </button>
  );
};

export default FollowButton;
