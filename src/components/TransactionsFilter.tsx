import { Filter } from 'lucide-react';

type TransactionsFilterProps = {
  filter: string;
  setFilter: (filter: string) => void;
};

export const TransactionsFilter = ({ filter, setFilter }: TransactionsFilterProps) => (
  <div className="flex items-center">
    <Filter className="h-4 w-4 text-gray-400 mr-2" />
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="all">All Status</option>
      <option value="pending">Pending</option>
      <option value="completed">Completed</option>
      <option value="failed">Failed</option>
    </select>
  </div>
);