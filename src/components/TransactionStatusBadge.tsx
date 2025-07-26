type TransactionStatusBadgeProps = {
  status: 'pending' | 'completed' | 'failed' | string;
};

export const TransactionStatusBadge = ({ status }: TransactionStatusBadgeProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'completed':
        return 'text-green-400 bg-green-400/10';
      case 'failed':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
      {status}
    </span>
  );
};