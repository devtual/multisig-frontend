import { ArrowUpRight, ArrowDownLeft, FileText, Send } from 'lucide-react';

type TransactionTypeIconProps = {
  type: 'outgoing' | 'incoming' | 'contract' | string;
};

export const TransactionTypeIcon = ({ type }: TransactionTypeIconProps) => {
  switch (type) {
    case 'outgoing':
      return <ArrowUpRight className="h-4 w-4 text-red-400" />;
    case 'incoming':
      return <ArrowDownLeft className="h-4 w-4 text-green-400" />;
    case 'contract':
      return <FileText className="h-4 w-4 text-primary-400" />;
    default:
      return <Send className="h-4 w-4 text-gray-400" />;
  }
};