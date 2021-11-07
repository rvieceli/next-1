import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

function formatDate(date: number | Date): string {
  return format(date, 'dd MMM y', { locale: ptBR });
}

export { formatDate };
