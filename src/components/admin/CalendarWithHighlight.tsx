
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CalendarWithHighlightProps {
  value: string;
  onChange: (date: string) => void;
  highlightDates: string[];
  statusMap?: Record<string, string>; // data -> status
}

export const CalendarWithHighlight: React.FC<CalendarWithHighlightProps> = ({
  value,
  onChange,
  highlightDates,
  statusMap = {}
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [open, setOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      onChange(format(date, 'yyyy-MM-dd'));
    } else {
      onChange('');
    }
    setOpen(false);
  };

  const getDateStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return statusMap[dateStr];
  };

  const isHighlighted = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return highlightDates.includes(dateStr);
  };

  const isPending = (date: Date) => {
    const status = getDateStatus(date);
    return status === 'pendente';
  };

  const isConfirmed = (date: Date) => {
    const status = getDateStatus(date);
    return status === 'confirmado';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "bg-gray-700 border-gray-600 text-white text-sm justify-start",
            !selectedDate && "text-gray-400"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Filtrar por data'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          className={cn("p-3 pointer-events-auto")}
          modifiers={{
            highlighted: isHighlighted,
            pending: isPending,
            confirmed: isConfirmed
          }}
          modifiersClassNames={{
            highlighted: "bg-blue-500 text-white hover:bg-blue-600",
            pending: "bg-orange-500 text-white hover:bg-orange-600",
            confirmed: "bg-green-500 text-white hover:bg-green-600"
          }}
        />
        {selectedDate && (
          <div className="p-2 border-t border-gray-700">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDateSelect(undefined)}
              className="w-full bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              Limpar filtro
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
