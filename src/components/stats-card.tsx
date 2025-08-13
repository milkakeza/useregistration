interface StatsCardProps {
  userCount: number;
}

export function StatsCard({ userCount }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
      <div className="flex items-center gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl">
          <i className="fas fa-users text-white text-xl"></i>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Total Registered Users
          </h3>
          <p className="text-3xl font-bold text-gray-900">{userCount}</p>
        </div>
      </div>
    </div>
  );
}
