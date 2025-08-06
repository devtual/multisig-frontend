import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

type TransactionStatusIconProps = {
  status: 'pending' | 'completed' | 'failed' | string;
};

export const TransactionStatusIcon = ({ status }: TransactionStatusIconProps) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'cancelled':
      return <XCircle className="h-5 w-5 text-red-400" />;
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-gray-500" />;
  }
};