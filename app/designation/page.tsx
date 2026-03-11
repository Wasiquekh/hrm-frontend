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

import LeftSideBar from "../component/LeftSideBar";
import DesktopHeader from "../component/DesktopHeader";
import AxiosProvider from "../../provider/AxiosProvider";

const axiosProvider = new AxiosProvider();

const designationValidationSchema = Yup.object({
  name: Yup.string()
    .required("Designation name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
});

export default function DesignationManagement() {
  const [designations, setDesignations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [flyoutMode, setFlyoutMode] = useState("add");
  const [isLoading, setIsLoading] = useState(false);

  const fetchDesignations = async () => {
    setIsLoading(true);
    try {
      const response = await axiosProvider.get(`/designations?page=${page}`);
      setDesignations(response?.data || []);
      setTotalPages(response?.pagination?.totalPages || 1);
    } catch (error) {
      toast.error("Failed to load designations");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch on page change
  useEffect(() => {
    fetchDesignations();
  }, [page]);

  const handleAdd = () => {
    setSelectedDesignation(null);
    setFlyoutMode("add");
    setIsFlyoutOpen(true);
  };

  const handleEdit = (designation: any) => {
    setSelectedDesignation(designation);
    setFlyoutMode("edit");
    setIsFlyoutOpen(true);
  };

  const handleDelete = async (id: any) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this designation?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      try {
        await axiosProvider.delete(`/designations/${id}`);
        toast.success("Designation deleted successfully");
        await fetchDesignations();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to delete designation");
      }
    }
  };

  const handleSubmit = async (values: any, { setSubmitting, resetForm  }) => {
    try {
      if (flyoutMode === "add") {
        await axiosProvider.post("/designations", { name: values.name });
        toast.success("Designation added successfully!");
        resetForm();
      } else {
        await axiosProvider.put(`/designations/${values.id}`, { name: values.name });
        toast.success("Designation updated successfully!");
      }
      
      setIsFlyoutOpen(false);
      await fetchDesignations();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save designation");
    } finally {
      setSubmitting(false);
    }
  };

  const resetFlyout = () => {
    setIsFlyoutOpen(false);
    setSelectedDesignation(null);
  };

  if (isLoading && designations.length === 0) {
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
                  Add Designation
                </p>
              </button>
            </div>

            <div className="relative overflow-x-auto sm:rounded-lg">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-[#999999]">
                  <tr className="border border-tableBorder">
                    <th scope="col" className="px-4 p-3 border border-tableBorder">
                      <div className="font-semibold text-firstBlack text-base leading-normal">
                        Designation Name
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
                  {designations.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center py-4 border border-tableBorder">
                        <p className="text-[#666666] text-base">No designations found</p>
                      </td>
                    </tr>
                  ) : (
                    designations.map((item, index) => (
                      <tr className="border border-tableBorder bg-white hover:bg-primary-100" key={item.id || index}>
                        <td className="px-4 md:p-3 py-2 border border-tableBorder">
                          <p className="text-[#232323] text-base leading-normal">
                            {item.name}
                          </p>
                        </td>
                        <td className="px-4 py-1 border border-tableBorder">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="py-[4px] px-3 bg-blue-500 hover:bg-blue-600 rounded-xl flex gap-1 items-center text-xs md:text-sm"
                              title="Edit Designation"
                            >
                              <MdModeEdit className="text-white w-4 h-4" />
                              <p className="text-white hidden md:block text-xs md:text-sm">
                                Edit
                              </p>
                            </button>
                            
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="py-[4px] px-3 bg-black hover:bg-red-600 rounded-xl flex gap-1 items-center text-xs md:text-sm"
                              title="Delete Designation"
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

          {designations.length > 0 && (
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
              {flyoutMode === "add" ? "Add Designation" : "Edit Designation"}
            </p>
            <IoCloseOutline
              onClick={resetFlyout}
              className="h-8 w-8 border border-[#E7E7E7] text-[#0A0A0A] rounded cursor-pointer"
            />
          </div>
          <div className="w-full border-b border-[#E7E7E7] mb-4"></div>

          <Formik
        
            initialValues={{
              id: selectedDesignation?.id || "",
              name: selectedDesignation?.name || "",
            }}
            validationSchema={designationValidationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-4">
                  <p className="text-[#0A0A0A] font-medium text-base mb-2">Designation Name</p>
                  <Field
                    type="text"
                    name="name"
                    className="w-full px-4 py-3 rounded border border-[#E7E7E7] focus:outline-none focus:ring-1 focus:ring-primary-600"
                    placeholder="Enter designation name"
                  />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                </div>

                <div className="mt-8 w-full flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-3 px-6 bg-primary-600 hover:bg-primary-500 rounded text-white font-medium disabled:opacity-50"
                  >
                    {isSubmitting 
                      ? (flyoutMode === "add" ? "Adding..." : "Updating...") 
                      : (flyoutMode === "add" ? "Add Designation" : "Update Designation")
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