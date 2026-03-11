"use client";

import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type DatePickerInputProps = {
  name: string;
  value: Date | null;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  placeholderText?: string;
  dateFormat?: string;
};

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  name,
  value,
  setFieldValue,
  placeholderText = "yyyy-mm-dd",
  dateFormat = "yyyy-MM-dd",
}) => {
  return (
    <DatePicker
      selected={value}
      onChange={(date: Date | null) => setFieldValue(name, date)}
      name={name}
      dateFormat={dateFormat}
      placeholderText={placeholderText}

      /* Year dropdown */
      showYearDropdown
      scrollableYearDropdown
      yearDropdownItemNumber={15}  // visible years

      /* No date restrictions - all dates are selectable */
      // Removed maxDate={today} to allow all dates

      /* Custom popup styling */
      popperClassName="custom-datepicker"

      className="hover:shadow-hoverInputShadow focus-border-primary 
      !w-full border border-[#DFEAF2] rounded-[4px] text-sm leading-4 
      font-medium placeholder-[#717171] py-4 px-4 bg-white shadow-sm"

      dayClassName={(date) => {
        const todayString = new Date().toDateString();
        const selectedDate = value ? new Date(value).toDateString() : null;

        if (todayString === date.toDateString())
          return "bg-[var(--primary-200)] text-[var(--primary-900)]";

        if (selectedDate === date.toDateString())
          return "bg-[var(--primary-600)] text-white";

        return "hover:bg-[var(--primary-100)] hover:text-[var(--primary-700)]";
      }}
    />
  );
};

export default DatePickerInput;