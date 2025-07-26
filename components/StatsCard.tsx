type StatsCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

export const StatsCard = ({ icon, label, value }: StatsCardProps) => (
  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
    <div className="flex items-center">
      {icon}
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  </div>
);