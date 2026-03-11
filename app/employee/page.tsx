"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { Formik, Form, Field, ErrorMessage, FormikErrors } from "formik";
import * as Yup from "yup";
import { MdModeEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoCloseOutline } from "react-icons/io5";
import { HiChevronDoubleLeft, HiChevronDoubleRight } from "react-icons/hi";
import { FaPlus, FaEye } from "react-icons/fa6";
import { TbStatusChange } from "react-icons/tb";
import { MdDelete } from "react-icons/md";

import LeftSideBar from "../component/LeftSideBar";
import DesktopHeader from "../component/DesktopHeader";
import AxiosProvider from "../../provider/AxiosProvider";
import DatePickerInput from "../component/DatePickerInput";
import SelectInput from "../component/SelectInput";

const axiosProvider = new AxiosProvider();

// Options
const genderOptions = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
  { value: "Other", label: "Other" },
];

const maritalStatusOptions = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Divorced", label: "Divorced" },
  { value: "Widowed", label: "Widowed" },
];

const bloodGroupOptions = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
];

// File upload fields - EXACT NAMES FROM BACKEND
const documentFields = [
  { name: "employee_photo", label: "Employee Photo", required: true },
  { name: "pan_card", label: "PAN Card", required: true },
  { name: "aadhar_card", label: "Aadhar Card", required: true },
  { name: "degree_certificate", label: "Degree Certificate", required: true },
  { name: "cv", label: "CV/Resume", required: true },
  { name: "light_bill", label: "Light Bill", required: true },
  { name: "bank_details", label: "Bank Details", required: true },
];

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [flyoutMode, setFlyoutMode] = useState("add");
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [filePreviews, setFilePreviews] = useState({});
  const [statusLoading, setStatusLoading] = useState(false);

  // Validation Schema - Different for add and edit
  const getValidationSchema = (mode) => {
    if (mode === "add") {
      return Yup.object({
        first_name: Yup.string().required("First name is required"),
        last_name: Yup.string().required("Last name is required"),
        date_of_birth: Yup.date().required("Date of birth is required").nullable(),
        gender: Yup.string().required("Gender is required"),
        marital_status: Yup.string().required("Marital status is required"),
        email: Yup.string().email("Invalid email").required("Email is required"),
        mobile: Yup.string()
          .matches(/^[0-9]{10}$/, "10 digits required")
          .required("Mobile is required"),
        alternate_mobile: Yup.string().matches(/^[0-9]{10}$/, "10 digits required").nullable(),
        address: Yup.string().required("Address is required"),
        city: Yup.string().required("City is required"),
        state: Yup.string().required("State is required"),
        blood_group: Yup.string().nullable(),
        qualification: Yup.string().nullable(),
        department_id: Yup.string().nullable(),
        designation_id: Yup.string().nullable(),
        date_of_joining: Yup.date().required("Date of joining is required").nullable(),
        salary: Yup.number().required("Salary is required").min(0),
        overtime_per_day: Yup.number().required("Overtime is required").min(0),
        travel_allowance: Yup.number().required("Travel allowance is required").min(0),
        account_number: Yup.string().required("Account number is required"),
        bank_name: Yup.string().required("Bank name is required"),
        ifsc_code: Yup.string().required("IFSC code is required"),
        branch_name: Yup.string().required("Branch name is required"),
        pan_number: Yup.string().required("PAN number is required"),
        aadhar_number: Yup.string()
          .matches(/^[0-9]{12}$/, "12 digits required")
          .required("Aadhar number is required"),
        
        // File fields - ALL REQUIRED FOR ADD
        employee_photo: Yup.mixed().required("Employee photo is required"),
        pan_card: Yup.mixed().required("PAN card is required"),
        aadhar_card: Yup.mixed().required("Aadhar card is required"),
        degree_certificate: Yup.mixed().required("Degree certificate is required"),
        cv: Yup.mixed().required("CV is required"),
        light_bill: Yup.mixed().required("Light bill is required"),
        bank_details: Yup.mixed().required("Bank details are required"),
      });
    } else {
      // For EDIT mode - documents are optional
      return Yup.object({
        first_name: Yup.string().required("First name is required"),
        last_name: Yup.string().required("Last name is required"),
        date_of_birth: Yup.date().required("Date of birth is required").nullable(),
        gender: Yup.string().required("Gender is required"),
        marital_status: Yup.string().required("Marital status is required"),
        email: Yup.string().email("Invalid email").required("Email is required"),
        mobile: Yup.string()
          .matches(/^[0-9]{10}$/, "10 digits required")
          .required("Mobile is required"),
       alternate_mobile: Yup.string().matches(/^[0-9]{10}$/, "10 digits required").nullable(),
        address: Yup.string().required("Address is required"),
        city: Yup.string().required("City is required"),
        state: Yup.string().required("State is required"),
        blood_group: Yup.string().nullable(),
        qualification: Yup.string().nullable(),
        department_id: Yup.string().nullable(),
        designation_id: Yup.string().nullable(),
        date_of_joining: Yup.date().required("Date of joining is required").nullable(),
        salary: Yup.number().required("Salary is required").min(0),
        overtime_per_day: Yup.number().required("Overtime is required").min(0),
        travel_allowance: Yup.number().required("Travel allowance is required").min(0),
        account_number: Yup.string().required("Account number is required"),
        bank_name: Yup.string().required("Bank name is required"),
        ifsc_code: Yup.string().required("IFSC code is required"),
        branch_name: Yup.string().required("Branch name is required"),
        pan_number: Yup.string().required("PAN number is required"),
        aadhar_number: Yup.string()
          .matches(/^[0-9]{12}$/, "12 digits required")
          .required("Aadhar number is required"),
        
        // File fields - OPTIONAL FOR EDIT
        employee_photo: Yup.mixed().nullable(),
        pan_card: Yup.mixed().nullable(),
        aadhar_card: Yup.mixed().nullable(),
        degree_certificate: Yup.mixed().nullable(),
        cv: Yup.mixed().nullable(),
        light_bill: Yup.mixed().nullable(),
        bank_details: Yup.mixed().nullable(),
      });
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await axiosProvider.get(`/employees?page=${page}`);
      setEmployees(response?.data || []);
      setTotalPages(response?.pagination?.totalPages || 1);
    } catch (error) {
      toast.error("Failed to load employees");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch departments
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

  // Fetch designations
  const fetchDesignations = async () => {
    try {
      const response = await axiosProvider.get("/designations?limit=100");
      const desigOptions = (response?.data || []).map((desig: any) => ({
        value: desig.id,
        label: desig.name,
      }));
      setDesignations(desigOptions);
    } catch (error) {
      console.error("Failed to load designations");
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchDesignations();
  }, [page]);

  const handleAdd = () => {
    setSelectedEmployee(null);
    setFlyoutMode("add");
    setFilePreviews({});
    setIsFlyoutOpen(true);
  };

  const handleEdit = (employee: any) => {
    setSelectedEmployee(employee);
    setFlyoutMode("edit");
    setFilePreviews({});
    setIsFlyoutOpen(true);
  };

  const handleDelete = async (id: any) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this employee?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      try {
        await axiosProvider.delete(`/employees/${id}`);
        toast.success("Employee deleted successfully");
        await fetchEmployees();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to delete employee");
      }
    }
  };

  // Status Change Handler
  const handleStatusChange = async (id: any, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const action = newStatus === "active" ? "activate" : "deactivate";

    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to ${action} this employee?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: newStatus === "active" ? "#28a745" : "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      setStatusLoading(true);
      try {
        await axiosProvider.post("/employees/status", { id, status: newStatus });
        toast.success(`Employee ${action}d successfully`);
        await fetchEmployees();
      } catch (error) {
        toast.error(error?.response?.data?.message || `Failed to ${action} employee`);
      } finally {
        setStatusLoading(false);
      }
    }
  };

  // File handlers
  const handleFileChange = (e: any, fieldName: string, setFieldValue: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setFieldValue(fieldName, file);
      setFilePreviews((prev: any) => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleRemoveFile = (fieldName: string, setFieldValue: any) => {
    setFieldValue(fieldName, null);
    setFilePreviews((prev: any) => ({ ...prev, [fieldName]: null }));
  };

const handleSubmit = async (values: any, { setSubmitting, resetForm }) => {
  try {
    const formData = new FormData();
    
    // Append all text fields
    Object.keys(values).forEach((key) => {
      // Skip file fields and id
      const fileFields = ['employee_photo', 'pan_card', 'aadhar_card', 'degree_certificate', 'cv', 'light_bill', 'bank_details'];
      
      if (key === 'id' || fileFields.includes(key)) {
        return;
      }
      
      if (values[key] !== null && values[key] !== undefined && values[key] !== "") {
        // Handle date fields
        if (key === 'date_of_birth' || key === 'date_of_joining') {
          if (values[key] instanceof Date) {
            const dateStr = values[key].toISOString().split('T')[0];
            formData.append(key, dateStr);
            console.log(`Adding date field: ${key} = ${dateStr}`);
          } else {
            formData.append(key, values[key]);
            console.log(`Adding date field: ${key} = ${values[key]}`);
          }
        } else {
          formData.append(key, values[key]);
          console.log(`Adding text field: ${key} = ${values[key]}`);
        }
      }
    });

    // Append file fields - ONLY IF THEY ARE FILES
    const fileFields = [
      'employee_photo', 
      'pan_card', 
      'aadhar_card', 
      'degree_certificate', 
      'cv',
      'light_bill', 
      'bank_details'
    ];
    
    let fileCount = 0;
    fileFields.forEach((field) => {
      if (values[field] instanceof File) {
        formData.append(field, values[field]);
        console.log(`✅ Adding file: ${field} = ${values[field].name}`);
        fileCount++;
      }
    });

    console.log(`Total files attached: ${fileCount}`);

    if (flyoutMode === "add") {
      // Check if all 7 files are present for add mode
      if (fileCount !== 7) {
        toast.error("All 7 documents are required");
        setSubmitting(false);
        return;
      }
      
      // ADD MODE - USE UPLOAD (POST with file headers)
      await axiosProvider.upload("/employees", formData);
      toast.success("Employee added successfully!");
      resetForm();
    } else {
      // EDIT MODE - USE UPDATE UPLOAD (PUT with file headers)
      console.log("Updating employee with ID:", values.id);
      await axiosProvider.updateUpload(`/employees/${values.id}`, formData);
      toast.success("Employee updated successfully!");
    }
    
    setIsFlyoutOpen(false);
    setFilePreviews({});
    await fetchEmployees();
  } catch (error: any) {
    console.error("Submit error:", error);
    
    // Detailed error logging
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      toast.error(error.response.data?.message || `Server error: ${error.response.status}`);
    } else if (error.request) {
      console.error("No response received:", error.request);
      toast.error("No response from server. Please check if backend is running.");
    } else {
      console.error("Error message:", error.message);
      toast.error(error.message || "Failed to save employee");
    }
  } finally {
    setSubmitting(false);
  }
};

  const resetFlyout = () => {
    setIsFlyoutOpen(false);
    setSelectedEmployee(null);
    setFilePreviews({});
  };

  if (isLoading && employees.length === 0) {
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
                  Add Employee
                </p>
              </button>
            </div>

            <div className="relative overflow-x-auto sm:rounded-lg">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#999999]">
                  <tr className="border border-tableBorder">
                    <th scope="col" className="px-4 p-3 border border-tableBorder">
                      <div className="font-semibold text-firstBlack text-base leading-normal whitespace-nowrap">
                        Employee Name
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-1 border border-tableBorder">
                      <div className="font-semibold text-firstBlack text-base leading-normal">
                        Email
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-1 border border-tableBorder">
                      <div className="font-semibold text-firstBlack text-base leading-normal">
                        Mobile
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-1 border border-tableBorder">
                      <div className="font-semibold text-firstBlack text-base leading-normal">
                        Department
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-1 border border-tableBorder">
                      <div className="font-semibold text-firstBlack text-base leading-normal">
                        Designation
                      </div>
                    </th>
                    <th scope="col" className="px-4 py-1 border border-tableBorder">
                      <div className="font-semibold text-firstBlack text-base leading-normal">
                        Status
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
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4 border border-tableBorder">
                        <p className="text-[#666666] text-base">No employees found</p>
                      </td>
                    </tr>
                  ) : (
                    employees.map((item: any, index) => (
                      <tr className="border border-tableBorder bg-white hover:bg-primary-100" key={item.id || index}>
                        <td className="px-4 md:p-3 py-2 border border-tableBorder">
                          <p className="text-[#232323] text-base leading-normal">
                            {item.first_name} {item.last_name}
                          </p>
                        </td>
                        <td className="px-4 py-1 border border-tableBorder">
                          <p className="text-[#232323] text-base">{item.email}</p>
                        </td>
                        <td className="px-4 py-1 border border-tableBorder">
                          <p className="text-[#232323] text-base">{item.mobile}</p>
                        </td>
                        <td className="px-4 py-1 border border-tableBorder">
                          <p className="text-[#232323] text-base">{item.department_name || "-"}</p>
                        </td>
                        <td className="px-4 py-1 border border-tableBorder">
                          <p className="text-[#232323] text-base">{item.designation_name || "-"}</p>
                        </td>
                        <td className="px-4 py-1 border border-tableBorder">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            item.status === "active" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-1 border border-tableBorder">
                          <div className="flex gap-2">
                            {/* Status Toggle Button */}
                            <button
                              onClick={() => handleStatusChange(item.id, item.status)}
                              className={`py-[4px] px-3 rounded-xl flex gap-1 items-center text-xs md:text-sm ${
                                item.status === "active" 
                                  ? "bg-orange-500 hover:bg-orange-600" 
                                  : "bg-green-500 hover:bg-green-600"
                              }`}
                              title={item.status === "active" ? "Deactivate" : "Activate"}
                            >
                              <TbStatusChange className="text-white w-4 h-4" />
                              <p className="text-white hidden md:block">
                                {item.status === "active" ? "Deactivate" : "Activate"}
                              </p>
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => handleEdit(item)}
                              className="py-[4px] px-3 bg-blue-500 hover:bg-blue-600 rounded-xl flex gap-1 items-center text-xs md:text-sm"
                              title="Edit Employee"
                            >
                              <MdModeEdit className="text-white w-4 h-4" />
                              <p className="text-white hidden md:block">Edit</p>
                            </button>
                            
                            {/* Delete Button */}
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="py-[4px] px-3 bg-black hover:bg-red-600 rounded-xl flex gap-1 items-center text-xs md:text-sm"
                              title="Delete Employee"
                            >
                              <RiDeleteBin6Line className="text-white w-4 h-4" />
                              <p className="text-white hidden md:block">Delete</p>
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

          {employees.length > 0 && (
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

      <div className={`fixed top-0 right-0 w-[90%] md:w-[80%] lg:w-[70%] h-full bg-white shadow-lg z-[1000] transition-all duration-300 ${isFlyoutOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto p-5`}>
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <p className="text-primary-600 text-2xl md:text-3xl font-bold">
              {flyoutMode === "add" ? "Add Employee" : "Edit Employee"}
            </p>
            <IoCloseOutline
              onClick={resetFlyout}
              className="h-8 w-8 border border-[#E7E7E7] text-[#0A0A0A] rounded cursor-pointer hover:bg-gray-100"
            />
          </div>
          <div className="w-full border-b border-[#E7E7E7] mb-6"></div>

          <Formik
            initialValues={{
              id: selectedEmployee?.id || "",
              first_name: selectedEmployee?.first_name || "",
              last_name: selectedEmployee?.last_name || "",
              date_of_birth: selectedEmployee?.date_of_birth ? new Date(selectedEmployee.date_of_birth) : null,
              gender: selectedEmployee?.gender || "",
              marital_status: selectedEmployee?.marital_status || "",
              email: selectedEmployee?.email || "",
              mobile: selectedEmployee?.mobile || "",
              alternate_mobile: selectedEmployee?.alternate_mobile || "",
              address: selectedEmployee?.address || "",
              city: selectedEmployee?.city || "",
              state: selectedEmployee?.state || "",
              blood_group: selectedEmployee?.blood_group || "",
              qualification: selectedEmployee?.qualification || "",
              department_id: selectedEmployee?.department_id || "",
              designation_id: selectedEmployee?.designation_id || "",
              date_of_joining: selectedEmployee?.date_of_joining ? new Date(selectedEmployee.date_of_joining) : null,
              salary: selectedEmployee?.salary || "",
              overtime_per_day: selectedEmployee?.overtime_per_day || "",
              travel_allowance: selectedEmployee?.travel_allowance || "",
              account_number: selectedEmployee?.account_number || "",
              bank_name: selectedEmployee?.bank_name || "",
              ifsc_code: selectedEmployee?.ifsc_code || "",
              branch_name: selectedEmployee?.branch_name || "",
              pan_number: selectedEmployee?.pan_number || "",
              aadhar_number: selectedEmployee?.aadhar_number || "",
              
              // File fields - EXACT BACKEND NAMES
              employee_photo: null,
              pan_card: null,
              aadhar_card: null,
              degree_certificate: null,
              cv: null,
              light_bill: null,
              bank_details: null,
            }}
            validationSchema={getValidationSchema(flyoutMode)}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, errors, touched, isSubmitting }) => (
              <Form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Info */}
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold text-primary-600 mb-3">Personal Information</h3>
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">First Name <span className="text-red-500">*</span></p>
                    <Field
                      type="text"
                      name="first_name"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      placeholder="Enter first name"
                    />
                    <ErrorMessage name="first_name" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Last Name <span className="text-red-500">*</span></p>
                    <Field
                      type="text"
                      name="last_name"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      placeholder="Enter last name"
                    />
                    <ErrorMessage name="last_name" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Date of Birth <span className="text-red-500">*</span></p>
                    <DatePickerInput
                      name="date_of_birth"
                      value={values.date_of_birth}
                      setFieldValue={setFieldValue}
                      placeholderText="Select date of birth"
                    />
                    <ErrorMessage name="date_of_birth" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Gender <span className="text-red-500">*</span></p>
                    <SelectInput
                      name="gender"
                      value={values.gender}
                      options={genderOptions}
                      setFieldValue={setFieldValue}
                      placeholder="Select gender"
                    />
                    <ErrorMessage name="gender" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Marital Status <span className="text-red-500">*</span></p>
                    <SelectInput
                      name="marital_status"
                      value={values.marital_status}
                      options={maritalStatusOptions}
                      setFieldValue={setFieldValue}
                      placeholder="Select marital status"
                    />
                    <ErrorMessage name="marital_status" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Blood Group</p>
                    <SelectInput
                      name="blood_group"
                      value={values.blood_group}
                      options={bloodGroupOptions}
                      setFieldValue={setFieldValue}
                      placeholder="Select blood group"
                    />
                  </div>

                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold text-primary-600 mb-3 mt-2">Contact Information</h3>
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Email <span className="text-red-500">*</span></p>
                    <Field
                      type="email"
                      name="email"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      placeholder="Enter email"
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Mobile <span className="text-red-500">*</span></p>
                    <Field
                      type="text"
                      name="mobile"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      placeholder="Enter 10 digit mobile"
                    />
                    <ErrorMessage name="mobile" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Alternate Mobile</p>
                    <Field
                      type="text"
                      name="alternate_mobile"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      placeholder="Enter alternate mobile"
                    />
                    <ErrorMessage name="alternate_mobile" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div className="col-span-2">
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Address <span className="text-red-500">*</span></p>
                    <Field
                      as="textarea"
                      name="address"
                      rows="3"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      placeholder="Enter address"
                    />
                    <ErrorMessage name="address" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">City <span className="text-red-500">*</span></p>
                    <Field
                      type="text"
                      name="city"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      placeholder="Enter city"
                    />
                    <ErrorMessage name="city" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">State <span className="text-red-500">*</span></p>
                    <Field
                      type="text"
                      name="state"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      placeholder="Enter state"
                    />
                    <ErrorMessage name="state" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold text-primary-600 mb-3 mt-2">Employment Information</h3>
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Department</p>
                    <SelectInput
                      name="department_id"
                      value={values.department_id}
                      options={departments}
                      setFieldValue={setFieldValue}
                      placeholder="Select department"
                    />
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Designation</p>
                    <SelectInput
                      name="designation_id"
                      value={values.designation_id}
                      options={designations}
                      setFieldValue={setFieldValue}
                      placeholder="Select designation"
                    />
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Date of Joining <span className="text-red-500">*</span></p>
                    <DatePickerInput
                      name="date_of_joining"
                      value={values.date_of_joining}
                      setFieldValue={setFieldValue}
                      placeholderText="Select date of joining"
                    />
                    <ErrorMessage name="date_of_joining" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Qualification</p>
                    <Field
                      type="text"
                      name="qualification"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      placeholder="Enter qualification"
                    />
                  </div>

                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold text-primary-600 mb-3 mt-2">Salary Information</h3>
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Salary <span className="text-red-500">*</span></p>
                    <Field
                      type="number"
                      name="salary"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      placeholder="Enter salary"
                    />
                    <ErrorMessage name="salary" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Overtime per day <span className="text-red-500">*</span></p>
                    <Field
                      type="number"
                      name="overtime_per_day"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      placeholder="Enter overtime amount"
                    />
                    <ErrorMessage name="overtime_per_day" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Travel Allowance <span className="text-red-500">*</span></p>
                    <Field
                      type="number"
                      name="travel_allowance"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      placeholder="Enter travel allowance"
                    />
                    <ErrorMessage name="travel_allowance" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold text-primary-600 mb-3 mt-2">Bank Information</h3>
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Account Number <span className="text-red-500">*</span></p>
                    <Field
                      type="text"
                      name="account_number"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      placeholder="Enter account number"
                    />
                    <ErrorMessage name="account_number" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Bank Name <span className="text-red-500">*</span></p>
                    <Field
                      type="text"
                      name="bank_name"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      placeholder="Enter bank name"
                    />
                    <ErrorMessage name="bank_name" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">IFSC Code <span className="text-red-500">*</span></p>
                    <Field
                      type="text"
                      name="ifsc_code"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      placeholder="Enter IFSC code"
                    />
                    <ErrorMessage name="ifsc_code" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Branch Name <span className="text-red-500">*</span></p>
                    <Field
                      type="text"
                      name="branch_name"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      placeholder="Enter branch name"
                    />
                    <ErrorMessage name="branch_name" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold text-primary-600 mb-3 mt-2">Identity Information</h3>
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">PAN Number <span className="text-red-500">*</span></p>
                    <Field
                      type="text"
                      name="pan_number"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      placeholder="Enter PAN number"
                    />
                    <ErrorMessage name="pan_number" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  <div>
                    <p className="text-[#0A0A0A] font-medium text-sm mb-2">Aadhar Number <span className="text-red-500">*</span></p>
                    <Field
                      type="text"
                      name="aadhar_number"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all"
                      placeholder="Enter 12 digit Aadhar number"
                    />
                    <ErrorMessage name="aadhar_number" component="div" className="text-red-500 text-xs mt-1" />
                  </div>

                  {/* File Upload Section - WITH CORRECT BACKEND NAMES */}
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold text-primary-600 mb-3 mt-2">Documents</h3>
                    <p className="text-sm text-red-500 mb-4">
                      {flyoutMode === "add" 
                        ? "All 7 documents are required" 
                        : "Upload new files only if you want to change (optional)"}
                    </p>
                  </div>

                  {documentFields.map((doc) => {
                    const hasFile = filePreviews[doc.name as keyof typeof filePreviews];
                    const hasExisting = selectedEmployee?.documents?.some(
                      (d: any) => d.document_type === doc.name
                    ) && flyoutMode === "edit";
// Check if this field has an error - FIXED VERSION
const hasError = doc.name in errors;
                    
                    return (
                      <div key={doc.name} className="col-span-2 md:col-span-1">
                        <p className="text-[#0A0A0A] font-medium text-sm mb-2">
                          {doc.label} {flyoutMode === "add" && <span className="text-red-500">*</span>}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            id={doc.name}
                            name={doc.name}
                            accept="image/*,.pdf"
                            onChange={(e) => handleFileChange(e, doc.name, setFieldValue)}
                            className="hidden"
                          />
                          
                          <label
                            htmlFor={doc.name}
                            className={`flex-1 px-4 py-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-all truncate
                              ${hasError ? 'border-red-500 bg-red-50' : 
                                (hasFile || hasExisting) ? 'border-green-500 bg-green-50' : 
                                'border-gray-200 hover:border-gray-300'}`}
                          >
                            {hasFile ? (
                              <span className="text-green-600 font-medium flex items-center gap-2">
                                <span className="text-lg">✓</span>
                                {(hasFile as File).name}
                              </span>
                            ) : hasExisting ? (
                              <span className="text-blue-600 flex items-center gap-2">
                                <span className="text-lg">📎</span>
                                Existing file
                              </span>
                            ) : (
                              <span className="text-gray-400 flex items-center gap-2">
                                <span className="text-lg">📁</span>
                                Choose file
                              </span>
                            )}
                          </label>
                          
                          {(hasFile || hasExisting) && (
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(doc.name, setFieldValue)}
                              className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                              title="Remove"
                            >
                              <MdDelete className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                        
                        {/* Show error message like other inputs */}
                        {hasError && (
                          <div className="text-red-500 text-xs mt-1">
                            {errors[doc.name] as string}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 w-full flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetFlyout}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting 
                      ? (flyoutMode === "add" ? "Adding..." : "Updating...") 
                      : (flyoutMode === "add" ? "Add Employee" : "Update Employee")
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