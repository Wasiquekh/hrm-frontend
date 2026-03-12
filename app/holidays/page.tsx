"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { MdModeEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoCloseOutline } from "react-icons/io5";
import { HiChevronDoubleLeft, HiChevronDoubleRight } from "react-icons/hi";
import { FaPlus } from "react-icons/fa6";
import { format } from "date-fns";

import LeftSideBar from "../component/LeftSideBar";
import DesktopHeader from "../component/DesktopHeader";
import AxiosProvider from "../../provider/AxiosProvider";
import DatePickerInput from "../component/DatePickerInput"; // Import your DatePicker

const axiosProvider = new AxiosProvider();

const holidayValidationSchema = Yup.object({
  date: Yup.date()
    .required("Date is required")
    .typeError("Invalid date format"),
  description: Yup.string()
    .required("Description is required")
    .min(2, "Description must be at least 2 characters")
    .max(255, "Description must not exceed 255 characters"),
});

export default function HolidayManagement() {
  const [holidays, setHolidays] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [flyoutMode, setFlyoutMode] = useState("add");
  const [isLoading, setIsLoading] = useState(false);

  const fetchHolidays = async () => {
    setIsLoading(true);
    try {
      const response = await axiosProvider.get(`/holidays?page=${page}`);
      setHolidays(response?.data || []);
      setTotalPages(response?.pagination?.totalPages || 1);
    } catch (error) {
      toast.error("Failed to load holidays");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on page change
  useEffect(() => {
    fetchHolidays();
  }, [page]);

  const handleAdd = () => {
    setSelectedHoliday(null);
    setFlyoutMode("add");
    setIsFlyoutOpen(true);
  };

  const handleEdit = (holiday: any) => {
    setSelectedHoliday(holiday);
    setFlyoutMode("edit");
    setIsFlyoutOpen(true);
  };

  const handleDelete = async (id: any) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this holiday?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      try {
        await axiosProvider.delete(`/holidays/${id}`);
        toast.success("Holiday deleted successfully");
        await fetchHolidays();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to delete holiday");
      }
    }
  };

  const handleSubmit = async (values: any, { setSubmitting, resetForm }) => {
    try {
      // Format date to YYYY-MM-DD before sending
      const formattedValues = {
        ...values,
        date: values.date ? format(new Date(values.date), 'yyyy-MM-dd') : null
      };

      if (flyoutMode === "add") {
        await axiosProvider.post("/holidays", formattedValues);
        toast.success("Holiday added successfully!");
        resetForm();
      } else {
        await axiosProvider.put(`/holidays/${values.id}`, formattedValues);
        toast.success("Holiday updated successfully!");
      }
      
      setIsFlyoutOpen(false);
      await fetchHolidays();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save holiday");
    } finally {
      setSubmitting(false);
    }
  };

  const resetFlyout = () => {
    setIsFlyoutOpen(false);
    setSelectedHoliday(null);
  };

  const formatDisplayDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  if (isLoading && holidays.length === 0) {
    return (
      <div className="h-screen flex flex-col gap-5 justify-center items-center">
        <Image
          src="/images/orizonIcon.svg"
          alt="Loading"
          width={150}
          height={150}
          className="animate-pulse rounded"
        />
      </div>
    );
  }

  return (
    <>
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

          <div className="rounded-3xl shadow-lastTransaction bg-white py-6 px-1 md:p-6 z-10 relative">
            <div className="w-full flex justify-end items-center mt-0 mb-8">
              <button
                onClick={handleAdd}
                className="flex items-center gap-[10px] h-12 px-3 py-[6px] rounded-[4px] shadow-borderShadow w-full sm:w-auto bg-primary-600 group hover:bg-primary-500"
              >
                <FaPlus className="h-[20px] w-[20px] text-white group-hover:text-white" />
                <p className="text-white text-base leading-normal group-hover:text-white">
                  Add Holiday
                </p>
              </button>
            </div>

            <div className="relative overflow-x-auto sm:rounded-lg">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#999999]">
                  <tr className="border border-tableBorder">
                    <th scope="col" className="px-4 p-3 border border-tableBorder">
                      <div className="font-semibold text-firstBlack text-base leading-normal">
                        Date
                      </div>
                    </th>
                    <th scope="col" className="px-4 p-3 border border-tableBorder">
                      <div className="font-semibold text-firstBlack text-base leading-normal">
                        Description
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-1 border border-tableBorder">
                      <div className="font-semibold text-firstBlack text-base leading-normal">
                        Action
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {holidays.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-4 border border-tableBorder">
                        <p className="text-[#666666] text-base">No holidays found</p>
                      </td>
                    </tr>
                  ) : (
                    holidays.map((item, index) => (
                      <tr className="border border-tableBorder bg-white hover:bg-primary-100" key={item.id || index}>
                        <td className="px-4 md:p-3 py-2 border border-tableBorder">
                          <p className="text-[#232323] text-base leading-normal">
                            {formatDisplayDate(item.date)}
                          </p>
                        </td>
                        <td className="px-4 md:p-3 py-2 border border-tableBorder">
                          <p className="text-[#232323] text-base leading-normal">
                            {item.description}
                          </p>
                        </td>
                        <td className="px-4 py-1 border border-tableBorder">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="py-[4px] px-3 bg-blue-500 hover:bg-blue-600 rounded-xl flex gap-1 items-center text-xs md:text-sm"
                              title="Edit Holiday"
                            >
                              <MdModeEdit className="text-white w-4 h-4" />
                              <p className="text-white hidden md:block text-xs md:text-sm">
                                Edit
                              </p>
                            </button>
                            
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="py-[4px] px-3 bg-black hover:bg-red-600 rounded-xl flex gap-1 items-center text-xs md:text-sm"
                              title="Delete Holiday"
                            >
                              <RiDeleteBin6Line className="text-white w-4 h-4" />
                              <p className="text-white hidden md:block text-xs md:text-sm">
                                Delete
                              </p>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {holidays.length > 0 && (
            <div className="flex justify-center items-center my-10 relative">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-2 py-2 mx-2 border rounded bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleLeft className="w-6 h-auto" />
              </button>
              
              <span className="text-firstBlack text-sm mx-4">
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-2 py-2 mx-2 border rounded bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiChevronDoubleRight className="w-6 h-auto" />
              </button>
            </div>
          )}
        </div>
      </div>

      {isFlyoutOpen && (
        <div
          className="min-h-screen w-full bg-[#1f1d1d80] fixed top-0 left-0 right-0 z-[999]"
          onClick={resetFlyout}
        ></div>
      )}

      <div className={`fixed top-0 right-0 w-[90%] md:w-[50%] h-full bg-white shadow-lg z-[1000] transition-all duration-300 ${isFlyoutOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto p-5`}>
        <div className="w-full">
          <div className="flex justify-between mb-4">
            <p className="text-primary-600 text-[22px] md:text-[26px] font-bold">
              {flyoutMode === "add" ? "Add Holiday" : "Edit Holiday"}
            </p>
            <IoCloseOutline
              onClick={resetFlyout}
              className="h-8 w-8 border border-[#E7E7E7] text-[#0A0A0A] rounded cursor-pointer"
            />
          </div>
          <div className="w-full border-b border-[#E7E7E7] mb-4"></div>

          <Formik
            initialValues={{
              id: selectedHoliday?.id || "",
              // FIX: Empty string "" for no date, NOT null!
              date: selectedHoliday?.date ? new Date(selectedHoliday.date) : "",
              description: selectedHoliday?.description || "",
            }}
            validationSchema={holidayValidationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, setFieldValue, setFieldTouched, values }) => (
              <Form>
                <div className="mb-4">
                  <p className="text-[#0A0A0A] font-medium text-base mb-2">Date</p>
                  <DatePickerInput
                    name="date"
                    value={values.date}
                    setFieldValue={setFieldValue}
                    setFieldTouched={setFieldTouched}
                    placeholderText="Select holiday date"
                    dateFormat="yyyy-MM-dd"
                  />
                  <ErrorMessage name="date" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className="mb-4">
                  <p className="text-[#0A0A0A] font-medium text-base mb-2">Description</p>
                  <Field
                    as="textarea"
                    name="description"
                    rows={4}
                    className="w-full px-4 py-3 rounded border border-[#E7E7E7] focus:outline-none focus:ring-1 focus:ring-primary-600 resize-none"
                    placeholder="Enter holiday description"
                  />
                  <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className="mt-8 w-full flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-3 px-6 bg-primary-600 hover:bg-primary-500 rounded text-white font-medium disabled:opacity-50"
                  >
                    {isSubmitting 
                      ? (flyoutMode === "add" ? "Adding..." : "Updating...") 
                      : (flyoutMode === "add" ? "Add Holiday" : "Update Holiday")
                    }
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
}