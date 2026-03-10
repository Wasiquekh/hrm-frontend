"use client";

import { useState, useEffect, useRef } from "react";
import { HiChevronLeft, HiChevronRight, HiCalendar, HiUserGroup } from "react-icons/hi";
import { FaSearch, FaFilter, FaSave, FaRedo, FaEye, FaTimes, FaUser, FaRupeeSign, FaBuilding } from "react-icons/fa";
import { MdOutlineCheckCircle } from "react-icons/md";
import Image from "next/image";
import LeftSideBar from "../component/LeftSideBar";
import DesktopHeader from "../component/DesktopHeader";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FaInfoCircle } from 'react-icons/fa';
import AxiosProvider from "../../provider/AxiosProvider";

const axiosProvider = new AxiosProvider();

// Attendance Status Types
type AttendanceStatus = "P" | "A" | "PL" | "HD" | "L" | "H" | "SL" | "OT" | null;

// Status Display Configuration
const STATUS_DISPLAY = {
  "P": {
    label: "P",
    fullLabel: "Present",
    color: "bg-green-100 text-green-800 border-green-300",
    letter: "P",
    bgColor: "bg-green-50"
  },
  "A": {
    label: "A",
    fullLabel: "Absent",
    color: "bg-red-100 text-red-800 border-red-300",
    letter: "A",
    bgColor: "bg-red-50"
  },
  "PL": {
    label: "PL",
    fullLabel: "Paid Leave",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    letter: "PL",
    bgColor: "bg-blue-50"
  },
  "HD": {
    label: "HD",
    fullLabel: "Half Day",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    letter: "HD",
    bgColor: "bg-yellow-50"
  },
  "L": {
    label: "L",
    fullLabel: "Leave",
    color: "bg-indigo-100 text-indigo-800 border-indigo-300",
    letter: "L",
    bgColor: "bg-indigo-50"
  },
  "H": {
    label: "H",
    fullLabel: "Holiday",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    letter: "H",
    bgColor: "bg-purple-50"
  },
  "SL": {
    label: "SL",
    fullLabel: "Sick Leave",
    color: "bg-orange-100 text-orange-800 border-orange-300",
    letter: "SL",
    bgColor: "bg-orange-50"
  },
  "OT": {
    label: "OT",
    fullLabel: "Over Time",
    color: "bg-cyan-100 text-cyan-800 border-cyan-300",
    letter: "OT",
    bgColor: "bg-cyan-50"
  },
  "S": {
    label: "S",
    fullLabel: "Sunday",
    color: "bg-red-100 text-red-800 border-red-300",
    letter: "S",
    bgColor: "bg-red-50"
  }
};

// Month names
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Days of week
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AttendanceCalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  // Filter State - only search
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Attendance Popup State
  const [attendancePopupOpen, setAttendancePopupOpen] = useState(false);
  const [selectedEmployeeForAttendance, setSelectedEmployeeForAttendance] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedHolidayName, setSelectedHolidayName] = useState<string>("");
  const [selectedIsSunday, setSelectedIsSunday] = useState<boolean>(false);

  // Salary Popup State
  const [salaryPopupOpen, setSalaryPopupOpen] = useState(false);
  const [selectedEmployeeForSalary, setSelectedEmployeeForSalary] = useState<any>(null);

  // Refs for popups
  const attendancePopupRef = useRef<HTMLDivElement>(null);
  const salaryPopupRef = useRef<HTMLDivElement>(null);

  const [allHolidays, setAllHolidays] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  console.log("All employees:", employees);
  console.log("All Holidays:", allHolidays);

  // Fetch holidays data
  const fetchHolidayData = async () => {
    try {
      const response = await axiosProvider.get("/holidays");
      setAllHolidays(response?.data || []);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      toast.error("Failed to load holidays");
    }
  };

  // Fetch employees data
  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await axiosProvider.get("/employees");
      console.log("Raw employee response:", response.data);
      setEmployees(response?.data || []);
      
      toast.success(`Loaded ${response?.data?.length || 0} employees`);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidayData();
    fetchEmployees();
  }, []);

  // Check if a date is Sunday
  const isDateSunday = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.getDay() === 0;
  };

  // Check if a date is holiday - using dynamic data from API
  const isDateHoliday = (dateStr: string) => {
    try {
      // Check if it's Sunday
      const isSunday = isDateSunday(dateStr);

      // Check in allHolidays array (from API)
      const holiday = allHolidays.find(h => h.date === dateStr);

      return {
        isHoliday: !!holiday || isSunday,
        holidayName: holiday?.description || holiday?.name || "",
        isSunday: isSunday,
        isCompanyHoliday: !!holiday
      };
    } catch (error) {
      return {
        isHoliday: false,
        holidayName: "",
        isSunday: isDateSunday(dateStr),
        isCompanyHoliday: false
      };
    }
  };

  // Initialize attendance for all employees
  useEffect(() => {
    if (employees.length === 0) return;
    
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    setEmployees(prev => prev.map(emp => {
      const attendance: { [date: string]: AttendanceStatus } = {};

      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const { isHoliday, isSunday } = isDateHoliday(dateStr);

        // Check if there's existing attendance
        if (emp.attendance && emp.attendance[dateStr]) {
          attendance[dateStr] = emp.attendance[dateStr];
        } else {
          // Set default based on holiday/sunday
          attendance[dateStr] = isHoliday ? (isSunday ? "S" as AttendanceStatus : "H" as AttendanceStatus) : null;
        }
      }

      return {
        ...emp,
        attendance: attendance
      };
    }));
  }, [selectedMonth, selectedYear, allHolidays]);

  // Get attendance summary for employee
  const getEmployeeSummary = (employee: any) => {
    try {
      if (!employee || !employee.attendance) {
        return {
          presentCount: 0,
          absentCount: 0,
          plCount: 0,
          hdCount: 0,
          leaveCount: 0,
          holidayCount: 0,
          slCount: 0,
          otCount: 0,
          sundayCount: 0,
          totalDays: 0
        };
      }

      const attendance = employee.attendance;
      let presentCount = 0;
      let absentCount = 0;
      let plCount = 0;
      let hdCount = 0;
      let leaveCount = 0;
      let holidayCount = 0;
      let slCount = 0;
      let otCount = 0;
      let sundayCount = 0;

      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

      // Count marked attendance
      Object.entries(attendance).forEach(([dateStr, status]) => {
        // Check if date is within current month
        const date = new Date(dateStr);
        if (date.getMonth() !== selectedMonth || date.getFullYear() !== selectedYear) {
          return;
        }

        const { isHoliday, isSunday, isCompanyHoliday } = isDateHoliday(dateStr);

        // Count Sundays separately
        if (isSunday) {
          sundayCount++;
        }

        // Count based on actual status
        if (status === "H" && isCompanyHoliday) {
          holidayCount++;
        } else if (status === "S" && isSunday) {
          // Already counted above
        } else {
          switch (status) {
            case "P": presentCount++; break;
            case "A": absentCount++; break;
            case "PL": plCount++; break;
            case "HD": hdCount++; break;
            case "L": leaveCount++; break;
            case "SL": slCount++; break;
            case "OT": otCount++; break;
            default: break;
          }
        }
      });

      // Count unmarked Sundays and holidays
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const { isHoliday, isSunday, isCompanyHoliday } = isDateHoliday(dateStr);

        if (isSunday && (!attendance[dateStr] || attendance[dateStr] === null)) {
          sundayCount++;
        } else if (isCompanyHoliday && (!attendance[dateStr] || attendance[dateStr] === null)) {
          holidayCount++;
        }
      }

      const totalDays = daysInMonth;

      return {
        presentCount,
        absentCount,
        plCount,
        hdCount,
        leaveCount,
        holidayCount,
        slCount,
        otCount,
        sundayCount,
        totalDays
      };
    } catch (error) {
      return {
        presentCount: 0,
        absentCount: 0,
        plCount: 0,
        hdCount: 0,
        leaveCount: 0,
        holidayCount: 0,
        slCount: 0,
        otCount: 0,
        sundayCount: 0,
        totalDays: new Date(selectedYear, selectedMonth + 1, 0).getDate()
      };
    }
  };

  // Calculate salary breakdown for an employee
  const calculateSalaryBreakdown = (employee: any, summary: any) => {
    // Get salary and travel allowance from employee data
    const basicSalary = employee.salary ? parseFloat(employee.salary) : 0;
    const travelAllowance = employee.travel_allowance ? parseFloat(employee.travel_allowance) : 0;

    // Working days = Total days - Sundays - Holidays
    const workingDays = summary.totalDays - summary.sundayCount - summary.holidayCount;

    // Daily rate = Basic salary / Working days
    const dailyRate = workingDays > 0 ? basicSalary / workingDays : 0;

    // Travel allowance per day = Travel allowance / Working days
    const taPerDay = workingDays > 0 ? travelAllowance / workingDays : 0;

    // EARNINGS
    const presentSalary = summary.presentCount * dailyRate;
    const presentTA = summary.presentCount * taPerDay;

    const paidLeaveSalary = summary.plCount * dailyRate;
    const paidLeaveTA = summary.plCount * taPerDay;

    const halfDaySalary = summary.hdCount * (dailyRate / 2);
    const halfDayTA = summary.hdCount * (taPerDay / 2);

    // SICK LEAVE: No salary deduction
    const sickLeaveSalary = summary.slCount * dailyRate;
    const sickLeaveTA = summary.slCount * taPerDay;

    // OVER TIME: Double salary and full TA
    const overTimeSalary = summary.otCount * (dailyRate * 2);
    const overTimeTA = summary.otCount * taPerDay;

    // Total earned salary
    const totalEarnedSalary = presentSalary + paidLeaveSalary + halfDaySalary + sickLeaveSalary + overTimeSalary;
    const totalEarnedTA = presentTA + paidLeaveTA + halfDayTA + sickLeaveTA + overTimeTA;

    // Total payable
    const totalPayable = totalEarnedSalary + totalEarnedTA;

    return {
      basicSalary,
      travelAllowance,
      workingDays,
      dailyRate: Number(dailyRate.toFixed(2)),
      taPerDay: Number(taPerDay.toFixed(2)),
      presentSalary: Number(presentSalary.toFixed(2)),
      presentTA: Number(presentTA.toFixed(2)),
      paidLeaveSalary: Number(paidLeaveSalary.toFixed(2)),
      paidLeaveTA: Number(paidLeaveTA.toFixed(2)),
      halfDaySalary: Number(halfDaySalary.toFixed(2)),
      halfDayTA: Number(halfDayTA.toFixed(2)),
      sickLeaveSalary: Number(sickLeaveSalary.toFixed(2)),
      sickLeaveTA: Number(sickLeaveTA.toFixed(2)),
      overTimeSalary: Number(overTimeSalary.toFixed(2)),
      overTimeTA: Number(overTimeTA.toFixed(2)),
      totalEarnedSalary: Number(totalEarnedSalary.toFixed(2)),
      totalEarnedTA: Number(totalEarnedTA.toFixed(2)),
      totalPayable: Number(totalPayable.toFixed(2))
    };
  };

  // Open salary popup
  const openSalaryPopup = (employee: any) => {
    setSelectedEmployeeForSalary(employee);
    setSalaryPopupOpen(true);
  };

  // Open attendance popup
  const openAttendancePopup = (employee: any, dateStr: string) => {
    const { isHoliday, holidayName, isSunday } = isDateHoliday(dateStr);

    // Disable attendance editing on holidays and Sundays
    if (isHoliday) {
      setSelectedEmployeeForAttendance(employee);
      setSelectedDate(dateStr);
      setSelectedHolidayName(holidayName || "");
      setSelectedIsSunday(isSunday);
      setAttendancePopupOpen(true);
      return;
    }

    setSelectedEmployeeForAttendance(employee);
    setSelectedDate(dateStr);
    setSelectedHolidayName(holidayName || "");
    setSelectedIsSunday(isSunday);
    setAttendancePopupOpen(true);
  };

  // Handle attendance selection - local state only, no API
  const handleAttendanceSelect = (status: AttendanceStatus) => {
    if (!selectedEmployeeForAttendance || !selectedDate) return;

    // Update local state only
    setEmployees(prev => prev.map(emp => {
      if (emp.id === selectedEmployeeForAttendance.id) {
        return {
          ...emp,
          attendance: {
            ...emp.attendance,
            [selectedDate]: status
          }
        };
      }
      return emp;
    }));

    const statusDisplay = STATUS_DISPLAY[status || ""];
    const employeeName = selectedEmployeeForAttendance.first_name 
      ? `${selectedEmployeeForAttendance.first_name} ${selectedEmployeeForAttendance.last_name || ''}`.trim()
      : selectedEmployeeForAttendance.name || "Employee";
    
    toast.success(`Marked ${employeeName} as ${statusDisplay?.fullLabel || status} for ${selectedDate}`);
    
    // Close popup
    setAttendancePopupOpen(false);
  };

  // Handle click outside popup to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attendancePopupOpen && attendancePopupRef.current && !attendancePopupRef.current.contains(event.target as Node)) {
        setAttendancePopupOpen(false);
      }
      if (salaryPopupOpen && salaryPopupRef.current && !salaryPopupRef.current.contains(event.target as Node)) {
        setSalaryPopupOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAttendancePopupOpen(false);
        setSalaryPopupOpen(false);
      }
    };

    if (attendancePopupOpen || salaryPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [attendancePopupOpen, salaryPopupOpen]);

  // Get days in current month
  const getDaysInMonth = () => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  };

  // Get first day of month
  const getFirstDayOfMonth = () => {
    return new Date(selectedYear, selectedMonth, 1).getDay();
  };

  // Generate calendar days array
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const days: any[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const { isHoliday, holidayName, isSunday, isCompanyHoliday } = isDateHoliday(dateStr);
      const isWeekend = dateStr ? new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6 : false;
      const today = new Date();
      const isToday = day === today.getDate() &&
        selectedMonth === today.getMonth() &&
        selectedYear === today.getFullYear();

      days.push({
        day,
        dateStr,
        isHoliday,
        holidayName,
        isSunday,
        isCompanyHoliday,
        isWeekend,
        isToday
      });
    }

    return days;
  };

  // Handle month navigation
  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  // Filter employees by search only
  const filteredEmployees = employees.filter(emp => {
    const employeeName = emp.first_name 
      ? `${emp.first_name} ${emp.last_name || ''}`.trim().toLowerCase()
      : (emp.name || "").toLowerCase();
    
    const empCode = (emp.employee_code || "").toLowerCase();
    const empEmail = (emp.email || "").toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch = searchQuery === "" ||
      employeeName.includes(searchLower) ||
      empCode.includes(searchLower) ||
      empEmail.includes(searchLower);

    return matchesSearch;
  });

  const calendarDays = generateCalendarDays();
  const isAdmin = true;

  return (
    <div className="flex justify-end min-h-screen">
      <LeftSideBar />

      <div className="w-full md:w-[83%] bg-[#F5F7FA] min-h-[500px] rounded p-4 mt-0 relative">
        <div className="absolute bottom-0 right-0">
          <Image
            src="/images/sideDesign.svg"
            alt="side design"
            width={100}
            height={100}
            className="w-full h-full"
          />
        </div>

        <DesktopHeader />

        <div className="w-full bg-[#F5F7FA] flex justify-center p-0 md:p-0">
          <div className="rounded-3xl shadow-lastTransaction bg-white px-1 py-6 md:p-6 relative min-h-[600px] z-10 w-full">
            {/* Header with Tabs */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Attendance Calendar</h2>
                  <p className="text-gray-600 mt-1">{MONTHS[selectedMonth]} {selectedYear}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded">Admin Mode</span>
                    <span className="text-xs text-gray-500">Live Data - {employees.length} employees</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-2">
                    <button onClick={goToPreviousMonth} className="p-1 hover:bg-gray-100 rounded">
                      <HiChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                      <HiCalendar className="text-primary-600" />
                      <span className="font-semibold">{MONTHS[selectedMonth]} {selectedYear}</span>
                    </div>
                    <button onClick={goToNextMonth} className="p-1 hover:bg-gray-100 rounded">
                      <HiChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar - Always visible */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search employees by name, code, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full h-12 border border-gray-300 rounded-lg text-[15px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end mt-2">
                <span className="text-gray-600 font-medium text-sm">
                  {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>

            {/* Status Legend */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Status Legend</h4>
              <div className="flex flex-wrap gap-4">
                {Object.entries(STATUS_DISPLAY).map(([status, config]) => (
                  <div key={status} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded flex items-center justify-center ${config.color} border`}>
                      <span className="text-sm font-bold">{config.letter}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">{config.fullLabel}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <p><strong>Note:</strong> Sundays are marked as <strong>S</strong> (Sunday) and cannot be edited</p>
                <p><strong>Company Holidays:</strong> Marked as <strong>H</strong> (Holiday) and cannot be edited</p>
                <p><strong>Sick Leave (SL):</strong> No salary deduction</p>
                <p><strong>Over Time (OT):</strong> Double salary + full TA</p>
                <p><strong>Attendance is saved locally</strong> (no database calls)</p>
              </div>
            </div>

            {/* ALL EMPLOYEES TABLE */}
            <div>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <FaEye className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-700">
                    <strong>Live Data:</strong> {employees.length} employees loaded from API. Click on any cell to mark attendance (local only). Click Salary button to view breakdown.
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                  <p className="text-gray-500 mt-4">Loading employees data...</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full min-w-[1200px]">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="sticky left-0 bg-gray-50 z-10 p-4 border-r border-gray-200 min-w-[220px] text-left">
                          <div className="flex items-center gap-2">
                            <HiUserGroup className="text-primary-600" />
                            <span className="font-semibold text-gray-700">Employee</span>
                          </div>
                        </th>

                        {calendarDays.map((dayInfo, index) => (
                          <th
                            key={index}
                            className={`p-3 border-r border-gray-200 text-center min-w-[70px] ${dayInfo?.isSunday ? 'bg-red-50' :
                              dayInfo?.isCompanyHoliday ? 'bg-purple-50' :
                                dayInfo?.isWeekend ? 'bg-blue-50' : ''
                              } ${dayInfo?.isToday ? 'bg-primary-50' : ''}`}
                          >
                            <div className="flex flex-col items-center">
                              <div className="text-xs font-medium text-gray-500">
                                {dayInfo ? DAYS[new Date(selectedYear, selectedMonth, dayInfo.day).getDay()] : ''}
                              </div>
                              <div className={`text-lg font-bold mt-1 ${dayInfo?.isSunday ? 'text-red-600' :
                                dayInfo?.isCompanyHoliday ? 'text-purple-600' :
                                  dayInfo?.isToday ? 'text-primary-600' : 'text-gray-800'
                                }`}>
                                {dayInfo?.day || ''}
                              </div>
                              {dayInfo?.isSunday && (
                                <div className="text-[10px] text-red-600 mt-1" title="Sunday">
                                  S
                                </div>
                              )}
                              {dayInfo?.isCompanyHoliday && !dayInfo?.isSunday && (
                                <div className="text-[10px] text-purple-600 mt-1" title={dayInfo.holidayName}>
                                  H
                                </div>
                              )}
                            </div>
                          </th>
                        ))}

                        <th className="sticky right-[70px] bg-gray-50 z-10 p-4 border-l border-gray-200 min-w-[180px] text-center">
                          <div className="font-semibold text-gray-700">Summary</div>
                        </th>

                        {/* Salary Button Column */}
                        <th className="sticky right-0 bg-gray-50 z-10 p-4 border-l border-gray-200 min-w-[70px] text-center">
                          <div className="font-semibold text-gray-700">Salary</div>
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredEmployees.length === 0 ? (
                        <tr>
                          <td colSpan={calendarDays.length + 3} className="p-8 text-center text-gray-500">
                            No employees found {searchQuery ? `matching "${searchQuery}"` : ''}
                          </td>
                        </tr>
                      ) : (
                        filteredEmployees.map((employee) => {
                          const summary = getEmployeeSummary(employee);
                          const employeeName = employee.first_name 
                            ? `${employee.first_name} ${employee.last_name || ''}`.trim()
                            : employee.name || "Unknown Employee";
                          const empCode = employee.employee_code || "N/A";
                          const empDept = employee.department_name || "General";
                          const empDesignation = employee.designation_name || employee.designation || "Employee";
                          const empStatus = employee.status || 'active';
                          const empSalary = employee.salary || "0";
                          const empTA = employee.travel_allowance || "0";

                          return (
                            <tr key={employee.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="sticky left-0 bg-white z-10 p-4 border-r border-gray-200">
                                <div>
                                  <div className="font-semibold text-gray-800 flex items-center gap-2">
                                    {employeeName}
                                    {empStatus === 'active' ? (
                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                                    ) : (
                                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Inactive</span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {empCode} •
                                    <span className="ml-1 flex items-center gap-1">
                                      <FaBuilding className="w-3 h-3" />
                                      {empDept}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {empDesignation}
                                    {employee.email && ` • ${employee.email}`}
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {empSalary && parseFloat(empSalary) > 0 && (
                                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                                        Salary: ₹{parseFloat(empSalary).toLocaleString()}
                                      </span>
                                    )}
                                    {empTA && parseFloat(empTA) > 0 && (
                                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                        TA: ₹{parseFloat(empTA).toLocaleString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {calendarDays.map((dayInfo, dayIndex) => {
                                if (!dayInfo) {
                                  return (
                                    <td
                                      key={`empty-${dayIndex}`}
                                      className="p-2 border-r border-gray-200 bg-gray-50"
                                    ></td>
                                  );
                                }

                                const status = employee.attendance?.[dayInfo.dateStr];
                                const { isHoliday, isSunday } = isDateHoliday(dayInfo.dateStr);
                                const isEditable = isAdmin && !isHoliday;
                                const statusConfig = status ? STATUS_DISPLAY[status] : null;

                                return (
                                  <td
                                    key={dayInfo.dateStr}
                                    className={`p-2 border-r border-gray-200 text-center ${dayInfo.isSunday ? 'bg-red-50' :
                                      dayInfo.isCompanyHoliday ? 'bg-purple-50' :
                                        dayInfo.isWeekend ? 'bg-blue-50' : ''
                                      } ${dayInfo.isHoliday ? (dayInfo.isSunday ? 'bg-red-50' : 'bg-purple-50') : ''
                                      } ${isEditable ? 'cursor-pointer hover:bg-gray-100' : 'cursor-not-allowed'
                                      }`}
                                    onClick={() => isEditable && openAttendancePopup(employee, dayInfo.dateStr)}
                                    title={
                                      isSunday ? `Sunday (Cannot edit)` :
                                        isHoliday ? `Company Holiday: ${dayInfo.holidayName || 'Holiday'} (Cannot edit)` :
                                          isEditable ? `Click to mark attendance for ${employeeName}` :
                                            `View only: ${employeeName}`
                                    }
                                  >
                                    {status ? (
                                      <div className={`flex items-center justify-center w-8 h-8 mx-auto rounded-lg border ${statusConfig?.color || ''} transition-all ${isEditable ? 'hover:scale-110' : ''}`}>
                                        <span className="text-sm font-bold">{statusConfig?.letter || status}</span>
                                      </div>
                                    ) : isSunday ? (
                                      <div className="flex items-center justify-center w-8 h-8 mx-auto rounded-lg border border-dashed border-red-300 text-red-400">
                                        S
                                      </div>
                                    ) : isHoliday ? (
                                      <div className="flex items-center justify-center w-8 h-8 mx-auto rounded-lg border border-dashed border-purple-300 text-purple-400">
                                        H
                                      </div>
                                    ) : (
                                      <div className={`flex items-center justify-center w-8 h-8 mx-auto rounded-lg border border-dashed border-gray-300 text-gray-400 ${isEditable ? 'hover:border-gray-400 hover:text-gray-500' : ''}`}>
                                        •
                                      </div>
                                    )}
                                  </td>
                                );
                              })}

                              <td className="sticky right-[70px] bg-white z-10 p-4 border-l border-gray-200">
                                <div className="space-y-2">
                                  <div className="grid grid-cols-3 gap-1">
                                    <div className="text-center">
                                      <div className="text-xl font-bold text-green-600">{summary.presentCount}</div>
                                      <div className="text-xs text-gray-500">P</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-xl font-bold text-red-600">{summary.absentCount}</div>
                                      <div className="text-xs text-gray-500">A</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-blue-600">{summary.plCount}</div>
                                      <div className="text-xs text-gray-500">PL</div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-1">
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-indigo-600">{summary.leaveCount}</div>
                                      <div className="text-xs text-gray-500">L</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-yellow-600">{summary.hdCount}</div>
                                      <div className="text-xs text-gray-500">HD</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-purple-600">{summary.holidayCount}</div>
                                      <div className="text-xs text-gray-500">H</div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-3 gap-1">
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-orange-600">{summary.slCount}</div>
                                      <div className="text-xs text-gray-500">SL</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-cyan-600">{summary.otCount}</div>
                                      <div className="text-xs text-gray-500">OT</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-red-500">{summary.sundayCount}</div>
                                      <div className="text-xs text-gray-500">S</div>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Salary Button Column - Only one button */}
                              <td className="sticky right-0 bg-white z-10 p-4 border-l border-gray-200">
                                <button
                                  onClick={() => openSalaryPopup(employee)}
                                  className="w-full flex flex-col items-center justify-center p-3 rounded-lg transition-all bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:scale-105"
                                  title="Click to view salary breakdown"
                                  type="button"
                                >
                                  <FaRupeeSign className="w-6 h-6 mb-1" />
                                  <span className="text-xs font-bold">Salary</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                    <FaEye className="w-3 h-3 text-primary-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">
                    How to use (Live Data)
                  </h4>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• <strong>{employees.length} employees</strong> loaded from API</li>
                    <li>• Click on any cell to mark/edit attendance</li>
                    <li>• <strong className="text-red-700">Sundays (S) are locked</strong> - compulsory weekly holidays</li>
                    <li>• <strong className="text-purple-700">Company Holidays (H) are locked</strong> (from API)</li>
                    <li>• <strong className="text-green-700">Attendance is saved locally</strong> in component state</li>
                    <li>• <strong className="text-green-700">Click the Salary button (₹)</strong> to view salary breakdown</li>
                    <li>• <strong>New Status:</strong> SL (Sick Leave) and OT (Over Time)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Popup - Inline */}
      {attendancePopupOpen && selectedEmployeeForAttendance && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          onClick={() => setAttendancePopupOpen(false)}
        >
          <div
            ref={attendancePopupRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {isDateHoliday(selectedDate).isHoliday ? (
              // Locked holiday view
              <>
                <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">Mark Attendance</h3>
                    <button
                      onClick={() => setAttendancePopupOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimes className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <FaUser className="w-4 h-4 text-primary-600" />
                      <p className="text-gray-700 font-medium">
                        {selectedEmployeeForAttendance.first_name 
                          ? `${selectedEmployeeForAttendance.first_name} ${selectedEmployeeForAttendance.last_name || ''}`.trim()
                          : selectedEmployeeForAttendance.name || "Employee"}
                      </p>
                      {isAdmin && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Admin Mode</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <HiCalendar className="w-4 h-4 text-primary-600" />
                      <p className="text-gray-600">{new Date(selectedDate).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-6 p-4 bg-purple-50 border-2 border-purple-300 rounded-lg">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-xl font-bold text-purple-600">
                          {selectedIsSunday ? "S" : "H"}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-purple-800">
                          {selectedIsSunday ? "Sunday" : "Company Holiday"}
                        </h4>
                        {selectedHolidayName && !selectedIsSunday && (
                          <p className="text-sm text-purple-600">{selectedHolidayName}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${selectedIsSunday ? 'bg-red-100 text-red-800 border-red-300' : 'bg-purple-100 text-purple-800 border-purple-300'} border`}>
                        <span className="text-base font-bold">{selectedIsSunday ? "S" : "H"}</span>
                        <span className="font-medium">{selectedIsSunday ? "Sunday" : "Holiday"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-300">
                    <div className="mb-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gray-200 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-700">Attendance Locked</h3>
                      <p className="text-gray-600 mt-2">
                        {selectedIsSunday
                          ? "Sundays are compulsory weekly holidays and cannot be edited"
                          : "Company holidays cannot be edited"}
                      </p>
                    </div>
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-700">
                        <strong>Note:</strong> {selectedIsSunday ? "Sundays" : "Holidays"} are automatically marked as "{selectedIsSunday ? "S" : "H"}" and cannot be changed.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                  <button
                    onClick={() => setAttendancePopupOpen(false)}
                    className="w-full px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              // Editable attendance view
              <>
                <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">Mark Attendance</h3>
                    <button
                      onClick={() => setAttendancePopupOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FaTimes className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <FaUser className="w-4 h-4 text-primary-600" />
                      <p className="text-gray-700 font-medium">
                        {selectedEmployeeForAttendance.first_name 
                          ? `${selectedEmployeeForAttendance.first_name} ${selectedEmployeeForAttendance.last_name || ''}`.trim()
                          : selectedEmployeeForAttendance.name || "Employee"}
                      </p>
                      {isAdmin && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Admin Mode</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <HiCalendar className="w-4 h-4 text-primary-600" />
                      <p className="text-gray-600">{new Date(selectedDate).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                  </div>
                </div>

                {selectedEmployeeForAttendance.attendance?.[selectedDate] && (
                  <div className="px-6 pt-4">
                    <p className="text-sm text-gray-500 mb-2">Current Status</p>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${STATUS_DISPLAY[selectedEmployeeForAttendance.attendance[selectedDate]]?.color || ''} border`}>
                      <span className="text-base font-bold">{STATUS_DISPLAY[selectedEmployeeForAttendance.attendance[selectedDate]]?.letter || selectedEmployeeForAttendance.attendance[selectedDate]}</span>
                      <span className="font-medium">{STATUS_DISPLAY[selectedEmployeeForAttendance.attendance[selectedDate]]?.fullLabel || selectedEmployeeForAttendance.attendance[selectedDate]}</span>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-4">Select New Status</p>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(STATUS_DISPLAY)
                      .filter(([key]) => key !== "H" && key !== "S")
                      .map(([status, config]) => {
                        const isSelected = selectedEmployeeForAttendance.attendance?.[selectedDate] === status;

                        return (
                          <button
                            key={status}
                            onClick={() => handleAttendanceSelect(status as AttendanceStatus)}
                            className={`
                              relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                              ${isSelected ? 'bg-primary-500 text-white border-primary-600' : config.color}
                              hover:scale-[1.02] cursor-pointer
                              ${isSelected ? 'ring-2 ring-offset-2 ring-primary-500' : ''}
                            `}
                          >
                            <div className="text-2xl font-bold mb-2">{config.letter}</div>
                            <span className="font-semibold text-sm mb-1">{config.fullLabel}</span>
                            {isSelected && (
                              <div className="absolute -top-2 -right-2">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <MdOutlineCheckCircle className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                  <button
                    onClick={() => setAttendancePopupOpen(false)}
                    className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Salary Popup - Inline */}
      {salaryPopupOpen && selectedEmployeeForSalary && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4"
          onClick={() => setSalaryPopupOpen(false)}
        >
          <div
            ref={salaryPopupRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const summary = getEmployeeSummary(selectedEmployeeForSalary);
              const salaryBreakdown = calculateSalaryBreakdown(selectedEmployeeForSalary, summary);
              
              return (
                <>
                  {/* Header */}
                  <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-800">Salary Breakdown</h3>
                      <button
                        onClick={() => setSalaryPopupOpen(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <FaTimes className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                      </button>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <FaUser className="w-4 h-4 text-primary-600" />
                        <p className="text-gray-700 font-medium">{selectedEmployeeForSalary.first_name} {selectedEmployeeForSalary.last_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiCalendar className="w-4 h-4 text-primary-600" />
                        <p className="text-gray-600">{MONTHS[selectedMonth]} {selectedYear}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaRupeeSign className="w-4 h-4 text-green-600" />
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Code:</span>
                          <span className="font-bold text-gray-700">{selectedEmployeeForSalary.employee_code}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Attendance Summary */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-700 mb-3">Attendance Summary</h4>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{summary.presentCount}</div>
                          <div className="text-xs text-gray-500">Present</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">{summary.absentCount}</div>
                          <div className="text-xs text-gray-500">Absent</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{summary.plCount}</div>
                          <div className="text-xs text-gray-500">Paid Leave</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-indigo-600">{summary.leaveCount}</div>
                          <div className="text-xs text-gray-500">Leave</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-600">{summary.hdCount}</div>
                          <div className="text-xs text-gray-500">Half Day</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{summary.holidayCount}</div>
                          <div className="text-xs text-gray-500">Holidays</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-orange-600">{summary.slCount}</div>
                          <div className="text-xs text-gray-500">Sick Leave</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-cyan-600">{summary.otCount}</div>
                          <div className="text-xs text-gray-500">Over Time</div>
                        </div>
                        <div className="text-center col-span-2">
                          <div className="text-lg font-bold text-red-600">{summary.sundayCount}</div>
                          <div className="text-xs text-gray-500">Sundays</div>
                        </div>
                        <div className="text-center col-span-2">
                          <div className="text-lg font-bold text-gray-700">{summary.totalDays}</div>
                          <div className="text-xs text-gray-500">Total Days</div>
                        </div>
                      </div>
                    </div>

                    {/* Monthly Salary Details */}
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-700 mb-2">Monthly Salary Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Basic Salary</span>
                          <span className="font-bold">₹{salaryBreakdown.basicSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Travel Allowance</span>
                          <span className="font-bold">₹{salaryBreakdown.travelAllowance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                          <span className="font-medium text-gray-700">Total Monthly</span>
                          <span className="font-bold text-blue-700">
                            ₹{(salaryBreakdown.basicSalary + salaryBreakdown.travelAllowance).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Daily Rate Calculation */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-700 mb-2">Daily Rate Calculation</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Working Days</span>
                          <span className="font-medium">{salaryBreakdown.workingDays} days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Daily Salary Rate</span>
                          <span className="font-medium">₹{salaryBreakdown.dailyRate.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Daily TA Rate</span>
                          <span className="font-medium">₹{salaryBreakdown.taPerDay.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Half Day Rate</span>
                          <span className="font-medium">₹{(salaryBreakdown.dailyRate / 2).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Over Time Rate (Double)</span>
                          <span className="font-medium">₹{(salaryBreakdown.dailyRate * 2).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Earnings */}
                    <div className="mb-6">
                      <h4 className="font-medium text-green-700 mb-2">Salary Earned</h4>
                      <div className="space-y-3">
                        {/* Present */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-600 mb-1">Present ({summary.presentCount} days)</h5>
                          <div className="space-y-1 pl-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Salary</span>
                              <span className="font-medium text-green-600">₹{salaryBreakdown.presentSalary.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Travel Allowance</span>
                              <span className="font-medium text-green-600">₹{salaryBreakdown.presentTA.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Paid Leave */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-600 mb-1">Paid Leave ({summary.plCount} days)</h5>
                          <div className="space-y-1 pl-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Salary</span>
                              <span className="font-medium text-green-600">₹{salaryBreakdown.paidLeaveSalary.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Travel Allowance</span>
                              <span className="font-medium text-green-600">₹{salaryBreakdown.paidLeaveTA.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Sick Leave */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-600 mb-1">Sick Leave ({summary.slCount} days)</h5>
                          <div className="space-y-1 pl-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Salary (No Deduction)</span>
                              <span className="font-medium text-green-600">₹{salaryBreakdown.sickLeaveSalary.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Travel Allowance</span>
                              <span className="font-medium text-green-600">₹{salaryBreakdown.sickLeaveTA.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Half Day */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-600 mb-1">Half Day ({summary.hdCount} days)</h5>
                          <div className="space-y-1 pl-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Salary</span>
                              <span className="font-medium text-green-600">₹{salaryBreakdown.halfDaySalary.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Travel Allowance</span>
                              <span className="font-medium text-green-600">₹{salaryBreakdown.halfDayTA.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Over Time */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-600 mb-1">Over Time ({summary.otCount} days)</h5>
                          <div className="space-y-1 pl-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Salary (Double)</span>
                              <span className="font-medium text-green-600">₹{salaryBreakdown.overTimeSalary.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Travel Allowance</span>
                              <span className="font-medium text-green-600">₹{salaryBreakdown.overTimeTA.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Total Earnings */}
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total Salary Earned</span>
                            <span className="font-bold text-green-700">₹{salaryBreakdown.totalEarnedSalary.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total TA Earned</span>
                            <span className="font-bold text-green-700">₹{salaryBreakdown.totalEarnedTA.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Days Without Salary */}
                    <div className="mb-6">
                      <h4 className="font-medium text-red-700 mb-2">No Salary Days</h4>
                      <div className="space-y-3">
                        {/* Leave */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-600 mb-1">Leave ({summary.leaveCount} days)</h5>
                          <div className="space-y-1 pl-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Salary Not Paid</span>
                              <span className="font-medium text-red-600">₹{(summary.leaveCount * salaryBreakdown.dailyRate).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">TA Not Paid</span>
                              <span className="font-medium text-red-600">₹{(summary.leaveCount * salaryBreakdown.taPerDay).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Absent */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-600 mb-1">Absent ({summary.absentCount} days)</h5>
                          <div className="space-y-1 pl-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">Salary Not Paid</span>
                              <span className="font-medium text-red-600">₹{(summary.absentCount * salaryBreakdown.dailyRate).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-500">TA Not Paid</span>
                              <span className="font-medium text-red-600">₹{(summary.absentCount * salaryBreakdown.taPerDay).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Total Unpaid Days */}
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Total Days Without Salary</span>
                            <span className="font-bold text-red-700">{summary.leaveCount + summary.absentCount} days</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">Salary Not Paid</span>
                            <span className="font-bold text-red-700">₹{((summary.leaveCount + summary.absentCount) * salaryBreakdown.dailyRate).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700">TA Not Paid</span>
                            <span className="font-bold text-red-700">₹{((summary.leaveCount + summary.absentCount) * salaryBreakdown.taPerDay).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Final Salary Summary */}
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <h4 className="font-bold text-gray-800 mb-3">Final Salary Calculation</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Salary Earned</span>
                          <span className="font-bold text-green-700">₹{salaryBreakdown.totalEarnedSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total TA Earned</span>
                          <span className="font-bold text-green-700">₹{salaryBreakdown.totalEarnedTA.toLocaleString()}</span>
                        </div>
                        <div className="pt-3 border-t border-green-300">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-800">Total Payable</span>
                            <span className="text-2xl font-bold text-green-800">
                              ₹{salaryBreakdown.totalPayable.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Working Days: {salaryBreakdown.workingDays} days |
                            Daily Rate: ₹{salaryBreakdown.dailyRate} |
                            TA Rate: ₹{salaryBreakdown.taPerDay}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-xl p-4">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => setSalaryPopupOpen(false)}
                        className="px-5 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 font-medium"
                      >
                        Close
                      </button>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <FaInfoCircle className="w-3 h-3" />
                        Calculation based on working days only
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}