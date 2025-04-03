import { format } from "date-fns";
import { useState } from "react";
import DatePickerСomponent from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';


interface DatePickerProps {
    id: string;
    value?: string;
    onChange: (date: string) => void;
    className?: string;
  }
  
  export const DatePicker = ({ id, value, onChange, className }: DatePickerProps) => {
    const [date, setDate] = useState<Date | null>(value ? new Date(value) : null);
  
    const handleChange = (date: Date | null) => {
      setDate(date);
      onChange(date ? format(date, "yyyy-MM-dd HH:mm:ss") : '');
    };
  
    return (
      <DatePickerСomponent
        id={id}
        selected={date}
        onChange={handleChange}
        dateFormat="yyyy-MM-dd"
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${className}`}
        showYearDropdown
        dropdownMode="select"
        isClearable
      />
    );
  };