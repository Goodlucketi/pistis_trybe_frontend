import { useQuery } from "@tanstack/react-query";
import { Users, FileText, Users2, ShieldOff, TrendingUp, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { getDashboardStats } from "../../../services/AdminService";
import StatCard from "../../../community/components/admin/StatCard";

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: getDashboardStats, refetchInterval: 60_000 });
  const o = data?.overview;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="w-8 h-8 border-4 border-[#401667] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Community overview and activity</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Users" 
          value={o?.totalUsers} 
          icon={<Users className="w-5 h-5" />} 
          color="purple" 
          sub={`+${o?.newUsersToday} today`} 
        />
        
        <StatCard 
          label="Active Users" 
          value={o?.activeUsers} 
          icon={<TrendingUp className="w-5 h-5" />} 
          color="green" 
          sub={`+${o?.newUsersToday} today`} 
        />
        
        <StatCard 
          label="Blocked Users" 
          value={o?.blockedUsers} 
          icon={<ShieldOff className="w-5 h-5" />} 
          color="red" 
        />
        
        <StatCard 
          label="Total Posts" 
          value={o?.totalPosts} 
          icon={<FileText className="w-5 h-5" />} 
          color="blue" 
          sub={`+${o?.newPostsToday} today`} 
        />
        
        <StatCard 
          label="Groups" 
          value={o?.totalGroups} 
          icon={<Users2 className="w-5 h-5" />} 
          color="amber" 
        />
        
        <StatCard 
          label="Comments" 
          value={o?.totalComments} 
          icon={<Activity className="w-5 h-5" />} 
          color="purple" 
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 text-sm">New Users (Last 30 days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data?.userGrowth || []}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#401667" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#401667" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
              <Area type="monotone" dataKey="count" name="Users" stroke="#401667" strokeWidth={2} fill="url(#userGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 text-sm">Post Activity (Last 30 days)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data?.postActivity || []}>
              <defs>
                <linearGradient id="postGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
              <Area type="monotone" dataKey="count" name="Posts" stroke="#16a34a" strokeWidth={2} fill="url(#postGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top posts */}
      {data?.topPosts?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 text-sm">Top Liked Posts</h2>
          <div className="space-y-3">
            {data.topPosts.map((post) => (
              <div key={post._id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                {post.authorId?.avatarUrl ? (
                  <img src={post.authorId.avatarUrl} className="w-8 h-8 rounded-full object-cover shrink-0" alt="" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#401667] flex items-center justify-center shrink-0">
                    <span className="text-white text-xs">{post.authorId?.fullName?.charAt(0) || "?"}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{post.authorId?.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{post.body}</p>
                </div>
                <span className="text-xs font-semibold text-[#401667] bg-purple-50 px-2 py-1 rounded-lg shrink-0">
                  ♥ {post.likesCount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
