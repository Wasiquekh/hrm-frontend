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
import { TbStatusChange } from "react-icons/tb";

import LeftSideBar from "../component/LeftSideBar";
import DesktopHeader from "../component/DesktopHeader";
import AxiosProvider from "../../provider/AxiosProvider";
import DatePickerInput from "../component/DatePickerInput";
import SelectInput from "../component/SelectInput";

const axiosProvider = new AxiosProvider();

// Employment Type Options
const employmentTypeOptions = [
  { value: "Full-time", label: "Full-time" },
  { value: "Part-time", label: "Part-time" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Internship" },
];

// Offer Status Options
const offerStatusOptions = [
  { value: "Pending", label: "Pending" },
  { value: "Accepted", label: "Accepted" },
  { value: "Rejected", label: "Rejected" },
  { value: "Expired", label: "Expired" },
];

// Validation Schema
const offerLetterValidationSchema = Yup.object({
  first_name: Yup.string()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters"),
  last_name: Yup.string()
    .required("Last name is required")
    .min(1, "Last name must be at least 1 character")
    .max(50, "Last name must not exceed 50 characters"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
    .nullable(),
  job_title: Yup.string()
    .required("Job title is required")
    .max(100, "Job title must not exceed 100 characters"),
  department_id: Yup.string().required("Department is required"),
  employment_type: Yup.string().required("Employment type is required"),
  offered_salary: Yup.number()
    .required("Offered salary is required")
    .positive("Salary must be positive"),
  offer_date: Yup.date().required("Offer date is required").nullable(),
  joining_date: Yup.date()
    .nullable()
    .min(Yup.ref("offer_date"), "Joining date must be after offer date"),
  reporting_manager: Yup.string()
    .required("Reporting manager is required")
    .max(100, "Reporting manager must not exceed 100 characters"),
  work_location: Yup.string()
    .required("Work location is required")
    .max(200, "Work location must not exceed 200 characters"),
  offer_status: Yup.string().required("Offer status is required"),
});

export default function OfferLetterManagement() {
  const [offers, setOffers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [flyoutMode, setFlyoutMode] = useState("add");
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  // 👇 COMPONENT LOAD HOTE HI SAVE KAR LO
  const [createdBy, setCreatedBy] = useState("");

  // LocalStorage se userId lo - component load hote hi
  useEffect(() => {
    const id = localStorage.getItem("userId") || "";
    setCreatedBy(id);
    console.log("Created By ID:", id); // Debug ke liye
  }, []);

  // Fetch departments for dropdown
  const fetchDepartments = async () => {
    try {
      const response = await axiosProvider.get("/departments?limit=100");
      const deptOptions = (response?.data || []).map((dept: any) => ({
        value: dept.id,
        label: dept.name,
      }));
      setDepartments(deptOptions);
    } catch (error) {
      console.error("Failed to load departments");
    }
  };

  // Fetch offer letters
  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const response = await axiosProvider.get(`/offer-letters?page=${page}`);
      setOffers(response?.data || []);
      setTotalPages(response?.pagination?.totalPages || 1);
    } catch (error) {
      toast.error("Failed to load offer letters");
    } finally {
      setIsLoading(false);
    }
  };

  // Sirf page change par fetch hoga
  useEffect(() => {
    fetchDepartments();
    fetchOffers();
  }, [page]);

  const handleAdd = () => {
    setSelectedOffer(null);
    setFlyoutMode("add");
    setIsFlyoutOpen(true);
  };

  const handleEdit = (offer: any) => {
    setSelectedOffer(offer);
    setFlyoutMode("edit");
    setIsFlyoutOpen(true);
  };

  const handleDelete = async (id: any) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this offer letter?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      try {
        await axiosProvider.delete(`/offer-letters/${id}`);
        toast.success("Offer letter deleted successfully");
        await fetchOffers();
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Failed to delete offer letter",
        );
      }
    }
  };

  // Submit Handler - WITH created_by from localStorage
  const handleSubmit = async (values: any, { setSubmitting, resetForm }) => {
    try {
      // Values mein created_by add karo - jo already save hai
      const payload = {
        ...values,
        created_by: createdBy, // 👈 YAHAN USE KARO
      };

      console.log("Submitting payload:", payload); // Debug ke liye

      if (flyoutMode === "add") {
        await axiosProvider.post("/offer-letters", payload);
        toast.success("Offer letter created successfully!");
        resetForm();
      } else {
        await axiosProvider.put(`/offer-letters/${values.id}`, payload);
        toast.success("Offer letter updated successfully!");
      }

      setIsFlyoutOpen(false);
      await fetchOffers();
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to save offer letter",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetFlyout = () => {
    setIsFlyoutOpen(false);
    setSelectedOffer(null);
  };

  // Format currency
  const formatSalary = (salary: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Accepted":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Loading state
  if (isLoading && offers.length === 0) {
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
            {/* Add Button */}
            <div className="w-full flex justify-end items-center mt-0 mb-8">
              <button
                onClick={handleAdd}
                className="flex items-center gap-[10px] h-12 px-3 py-[6px] rounded-[4px] shadow-borderShadow w-full sm:w-auto bg-primary-600 group hover:bg-primary-500"
              >
                <FaPlus className="h-[20px] w-[20px] text-white group-hover:text-white" />
                <p className="text-white text-base leading-normal group-hover:text-white">
                  Create Offer Letter
                </p>
              </button>
            </div>

            {/* Table */}
            <div className="relative overflow-x-auto sm:rounded-lg">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#999999]">
                  <tr className="border border-tableBorder">
                    <th
                      scope="col"
                      className="px-4 p-3 border border-tableBorder"
                    >
                      <div className="font-semibold text-firstBlack text-base leading-normal whitespace-nowrap">
                        Candidate Name
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-1 border border-tableBorder"
                    >
                      <div className="font-semibold text-firstBlack text-base leading-normal">
                        Email
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-1 border border-tableBorder"
                    >
                      <div className="font-semibold text-firstBlack text-base leading-normal">
                        Job Title
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-1 border border-tableBorder"
                    >
                      <div className="font-semibold text-firstBlack text-base leading-normal">
                        Department
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-1 border border-tableBorder"
                    >
                      <div className="font-semibold text-firstBlack text-base leading-normal">
                        Salary
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-1 border border-tableBorder"
                    >
                      <div className="font-semibold text-firstBlack text-base leading-normal">
                        Offer Date
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-1 border border-tableBorder"
                    >
                      <div className="font-semibold text-firstBlack text-base leading-normal">
                        Status
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-1 border border-tableBorder"
                    >
                      <div className="font-semibold text-firstBlack text-base leading-normal">
                        Action
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {offers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-4 border border-tableBorder"
                      >
                        <p className="text-[#666666] text-base">
                          No offer letters found
                        </p>
                      </td>
                    </tr>
                  ) : (
                    offers.map((item: any, index) => (
                      <tr
                        className="border border-tableBorder bg-white hover:bg-primary-100"
                        key={item.id || index}
                      >
                        <td className="px-4 md:p-3 py-2 border border-tableBorder">
                          <p className="text-[#232323] text-base leading-normal capitalize">
                            {item.first_name} {item.last_name}
                          </p>
                        </td>
                        <td className="px-4 py-1 border border-tableBorder">
                          <p className="text-[#232323] text-base">
                            {item.email}
                          </p>
                        </td>
                        <td className="px-4 py-1 border border-tableBorder">
                          <p className="text-[#232323] text-base whitespace-nowrap">
                            {item.job_title}
                          </p>
                        </td>
                        <td className="px-4 py-1 border border-tableBorder">
                          <p className="text-[#232323] text-base">
                            {item.department_name || "-"}
                          </p>
                        </td>
                        <td className="px-4 py-1 border border-tableBorder">
                          <p className="text-[#232323] text-base font-semibold">
                            {formatSalary(item.offered_salary)}
                          </p>
                        </td>
                        <td className="px-4 py-1 border border-tableBorder">
                          <p className="text-[#232323] text-base">
                            {formatDate(item.offer_date)}
                          </p>
                        </td>
                        <td className="px-4 py-1 border border-tableBorder">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(item.offer_status)}`}
                          >
                            {item.offer_status}
                          </span>
                        </td>
                        <td className="px-4 py-1 border border-tableBorder">
                          <div className="flex gap-2">
                            {/* Status Change Button - Only for Pending/Accepted */}

                            {/* Edit Button */}
                            <button
                              onClick={() => handleEdit(item)}
                              className="py-[4px] px-3 bg-blue-500 hover:bg-blue-600 rounded-xl flex gap-1 items-center text-xs md:text-sm"
                              title="Edit Offer Letter"
                            >
                              <MdModeEdit className="text-white w-4 h-4" />
                              <p className="text-white hidden md:block text-xs">
                                Edit
                              </p>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="py-[4px] px-3 bg-black hover:bg-red-600 rounded-xl flex gap-1 items-center text-xs md:text-sm"
                              title="Delete Offer Letter"
                            >
                              <RiDeleteBin6Line className="text-white w-4 h-4" />
                              <p className="text-white hidden md:block text-xs">
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

          {/* Pagination */}
          {offers.length > 0 && (
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

      {/* Flyout Overlay */}
      {isFlyoutOpen && (
        <div
          className="min-h-screen w-full bg-[#1f1d1d80] fixed top-0 left-0 right-0 z-[999]"
          onClick={resetFlyout}
        ></div>
      )}

      {/* Flyout Form */}
      <div
        className={`fixed top-0 right-0 w-[90%] md:w-[70%] lg:w-[60%] h-full bg-white shadow-lg z-[1000] transition-all duration-300 ${
          isFlyoutOpen ? "translate-x-0" : "translate-x-full"
        } overflow-y-auto p-5`}
      >
        <div className="w-full">
          <div className="flex justify-between mb-4">
            <p className="text-primary-600 text-[22px] md:text-[26px] font-bold">
              {flyoutMode === "add"
                ? "Create Offer Letter"
                : "Edit Offer Letter"}
            </p>
            <IoCloseOutline
              onClick={resetFlyout}
              className="h-8 w-8 border border-[#E7E7E7] text-[#0A0A0A] rounded cursor-pointer"
            />
          </div>
          <div className="w-full border-b border-[#E7E7E7] mb-4"></div>

          {/* Formik Form */}
          <Formik
            initialValues={{
              id: selectedOffer?.id || "",
              first_name: selectedOffer?.first_name || "",
              last_name: selectedOffer?.last_name || "",
              email: selectedOffer?.email || "",
              phone: selectedOffer?.phone || "",
              job_title: selectedOffer?.job_title || "",
              department_id: selectedOffer?.department_id || "",
              employment_type: selectedOffer?.employment_type || "Full-time",
              offered_salary: selectedOffer?.offered_salary || "",
              offer_date: selectedOffer?.offer_date
                ? new Date(selectedOffer.offer_date)
                : "",
              joining_date: selectedOffer?.joining_date
                ? new Date(selectedOffer.joining_date)
                : "",
              reporting_manager: selectedOffer?.reporting_manager || "",
              work_location: selectedOffer?.work_location || "",
              offer_status: selectedOffer?.offer_status || "Pending",
            }}
            validationSchema={offerLetterValidationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, setFieldTouched, isSubmitting }) => (
              <Form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal Information */}
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold text-primary-600 mb-2">
                      Personal Information
                    </h3>
                  </div>

                  {/* First Name */}
                  <div className="mb-3">
                    <p className="text-[#0A0A0A] font-medium text-sm mb-1">
                      First Name <span className="text-red-500">*</span>
                    </p>
                    <Field
                      type="text"
                      name="first_name"
                      className="w-full px-4 py-2.5 rounded border border-[#E7E7E7] focus:outline-none focus:ring-1 focus:ring-primary-600"
                      placeholder="Enter first name"
                    />
                    <ErrorMessage
                      name="first_name"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="mb-3">
                    <p className="text-[#0A0A0A] font-medium text-sm mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </p>
                    <Field
                      type="text"
                      name="last_name"
                      className="w-full px-4 py-2.5 rounded border border-[#E7E7E7] focus:outline-none focus:ring-1 focus:ring-primary-600"
                      placeholder="Enter last name"
                    />
                    <ErrorMessage
                      name="last_name"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <p className="text-[#0A0A0A] font-medium text-sm mb-1">
                      Email <span className="text-red-500">*</span>
                    </p>
                    <Field
                      type="email"
                      name="email"
                      className="w-full px-4 py-2.5 rounded border border-[#E7E7E7] focus:outline-none focus:ring-1 focus:ring-primary-600"
                      placeholder="Enter email"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Phone */}
                  <div className="mb-3">
                    <p className="text-[#0A0A0A] font-medium text-sm mb-1">
                      Phone Number
                    </p>
                    <Field
                      type="text"
                      name="phone"
                      className="w-full px-4 py-2.5 rounded border border-[#E7E7E7] focus:outline-none focus:ring-1 focus:ring-primary-600"
                      placeholder="Enter 10 digit phone"
                    />
                    <ErrorMessage
                      name="phone"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Job Information */}
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold text-primary-600 mb-2 mt-2">
                      Job Information
                    </h3>
                  </div>

                  {/* Job Title */}
                  <div className="mb-3">
                    <p className="text-[#0A0A0A] font-medium text-sm mb-1">
                      Job Title <span className="text-red-500">*</span>
                    </p>
                    <Field
                      type="text"
                      name="job_title"
                      className="w-full px-4 py-2.5 rounded border border-[#E7E7E7] focus:outline-none focus:ring-1 focus:ring-primary-600"
                      placeholder="Enter job title"
                    />
                    <ErrorMessage
                      name="job_title"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Department */}
                  <div className="mb-3">
                    <p className="text-[#0A0A0A] font-medium text-sm mb-1">
                      Department <span className="text-red-500">*</span>
                    </p>
                    <SelectInput
                      name="department_id"
                      value={values.department_id}
                      options={departments}
                      setFieldValue={setFieldValue}
                      placeholder="Select department"
                    />
                    <ErrorMessage
                      name="department_id"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Employment Type */}
                  <div className="mb-3">
                    <p className="text-[#0A0A0A] font-medium text-sm mb-1">
                      Employment Type <span className="text-red-500">*</span>
                    </p>
                    <SelectInput
                      name="employment_type"
                      value={values.employment_type}
                      options={employmentTypeOptions}
                      setFieldValue={setFieldValue}
                      placeholder="Select employment type"
                    />
                    <ErrorMessage
                      name="employment_type"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Offered Salary */}
                  <div className="mb-3">
                    <p className="text-[#0A0A0A] font-medium text-sm mb-1">
                      Offered Salary (₹) <span className="text-red-500">*</span>
                    </p>
                    <Field
                      type="number"
                      name="offered_salary"
                      className="w-full px-4 py-2.5 rounded border border-[#E7E7E7] focus:outline-none focus:ring-1 focus:ring-primary-600"
                      placeholder="Enter salary"
                    />
                    <ErrorMessage
                      name="offered_salary"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Dates */}
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold text-primary-600 mb-2 mt-2">
                      Dates
                    </h3>
                  </div>

                  {/* Offer Date */}
                  <div className="mb-3">
                    <p className="text-[#0A0A0A] font-medium text-sm mb-1">
                      Offer Date <span className="text-red-500">*</span>
                    </p>
                    <DatePickerInput
                      name="offer_date"
                      value={values.offer_date}
                      setFieldValue={setFieldValue}
                      setFieldTouched={setFieldTouched}
                      placeholderText="yyyy-mm-dd"
                    />
                    <ErrorMessage
                      name="offer_date"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Joining Date */}
                  <div className="mb-3">
                    <p className="text-[#0A0A0A] font-medium text-sm mb-1">
                      Joining Date
                    </p>
                    <DatePickerInput
                      name="joining_date"
                      value={values.joining_date}
                      setFieldValue={setFieldValue}
                      setFieldTouched={setFieldTouched}
                      placeholderText="yyyy-mm-dd"
                    />
                    <ErrorMessage
                      name="joining_date"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Reporting & Location */}
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold text-primary-600 mb-2 mt-2">
                      Reporting & Location
                    </h3>
                  </div>

                  {/* Reporting Manager */}
                  <div className="mb-3">
                    <p className="text-[#0A0A0A] font-medium text-sm mb-1">
                      Reporting Manager <span className="text-red-500">*</span>
                    </p>
                    <Field
                      type="text"
                      name="reporting_manager"
                      className="w-full px-4 py-2.5 rounded border border-[#E7E7E7] focus:outline-none focus:ring-1 focus:ring-primary-600"
                      placeholder="Enter reporting manager name"
                    />
                    <ErrorMessage
                      name="reporting_manager"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Work Location */}
                  <div className="mb-3">
                    <p className="text-[#0A0A0A] font-medium text-sm mb-1">
                      Work Location <span className="text-red-500">*</span>
                    </p>
                    <Field
                      type="text"
                      name="work_location"
                      className="w-full px-4 py-2.5 rounded border border-[#E7E7E7] focus:outline-none focus:ring-1 focus:ring-primary-600"
                      placeholder="Enter work location"
                    />
                    <ErrorMessage
                      name="work_location"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold text-primary-600 mb-2 mt-2">
                      Offer Status
                    </h3>
                  </div>

                  {/* Offer Status */}
                  <div className="mb-3 col-span-2">
                    <p className="text-[#0A0A0A] font-medium text-sm mb-1">
                      Status <span className="text-red-500">*</span>
                    </p>
                    <SelectInput
                      name="offer_status"
                      value={values.offer_status}
                      options={offerStatusOptions}
                      setFieldValue={setFieldValue}
                      placeholder="Select status"
                    />
                    <ErrorMessage
                      name="offer_status"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-6 w-full flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2.5 px-6 bg-primary-600 hover:bg-primary-500 rounded text-white font-medium disabled:opacity-50"
                  >
                    {isSubmitting
                      ? flyoutMode === "add"
                        ? "Creating..."
                        : "Updating..."
                      : flyoutMode === "add"
                        ? "Create Offer Letter"
                        : "Update Offer Letter"}
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
