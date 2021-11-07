import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

function formatDateTime(date: number | Date): string {
  return format(date, "dd MMM y', às 'HH:mm", { locale: ptBR });
}

export { formatDateTime };
