import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Shield, UserX, Crown } from "lucide-react";
import { getGroupById, getGroupMembers, kickMember, promoteMember } from "../../../services/GroupService";

const GroupMembers = ({ currentUserId = 1 }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: community } = useQuery({
    queryKey: ['group', id],
    queryFn: () => getGroupById(id),
  });

  const { data: membersData } = useQuery({
    queryKey: ['group-members', id],
    queryFn: () => getGroupMembers(id),
  });

  const members = membersData?.members || community?.members || [];
  
  const currentUserRole = members?.find(m => m.id === currentUserId)?.role;
  const isAdmin = currentUserRole === "admin";

  const kickMutation = useMutation({
    mutationFn: (userId) => kickMember({ groupId: id, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-members', id] });
      queryClient.invalidateQueries({ queryKey: ['group', id] });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: (userId) => promoteMember({ groupId: id, userId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['group-members', id] }),
  });

  if (!community) return <div className="p-8">Group not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      <button onClick={() => navigate(`/dashboard/groups/${id}`)} className="flex items-center gap-2 text-gray-600 mb-6">
        <ArrowLeft size={20} /> Back to Group
      </button>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-6">Members ({community.membersCount})</h1>
        
        <div className="space-y-3">
          {members?.map(member => (
            <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full" />
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    {member.name}
                    {member.role === "admin" && <Crown size={16} className="text-yellow-500" />}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                </div>
              </div>

              {isAdmin && member.id!== currentUserId && (
                <div className="flex gap-2">
                  {member.role!== "admin" && (
                    <button 
                      onClick={() => promoteMutation.mutate(member.id)}
                      disabled={promoteMutation.isPending}
                      className="p-2 hover:bg-gray-100 rounded-lg text-[#401667]"
                      title="Make Admin"
                    >
                      <Shield size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => kickMutation.mutate(member.id)}
                    disabled={kickMutation.isPending}
                    className="p-2 hover:bg-gray-100 rounded-lg text-red-600"
                    title="Remove"
                  >
                    <UserX size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupMembers;