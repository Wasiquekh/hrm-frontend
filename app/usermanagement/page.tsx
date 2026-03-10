"use client";
import Image from "next/image";
import { RxAvatar } from "react-icons/rx";
import { MdOutlineCall } from "react-icons/md";
import { LiaArrowCircleDownSolid } from "react-icons/lia";
import { MdModeEdit } from "react-icons/md";
import { RiDeleteBin6Line, RiKey2Line } from "react-icons/ri";
import { IoCloseOutline } from "react-icons/io5";
import Link from "next/link";
import { useEffect, useState } from "react";
import AxiosProvider from "../../provider/AxiosProvider";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import LeftSideBar from "../component/LeftSideBar";
import DesktopHeader from "../component/DesktopHeader";
import { HiChevronDoubleLeft, HiChevronDoubleRight } from "react-icons/hi";
import { FaPlus } from "react-icons/fa6";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const axiosProvider = new AxiosProvider();

export default function UserManagement() {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [flyoutMode, setFlyoutMode] = useState("edit");
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const editValidationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    mobile_number: Yup.string()
      .required("Mobile number is required")
      .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
  });

 const fetchData = async (currentPage: number) => {
  setIsLoading(true);
  try {
    const response = await axiosProvider.get(`/users?page=${currentPage}`);
    console.log("API Response:", response);
    
    setData(response?.data || []);
    setTotalPages(response?.pagination?.totalPages || 1);
    
  } catch (error: any) {
    console.error("Error fetching data:", error);
    toast.error("Failed to load users");
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchData(page);
  }, [shouldRefetch, page]);

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setFlyoutMode("edit");
    setIsFlyoutOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      try {
        await axiosProvider.delete(`/users/${id}`);
        toast.success("Successfully Deleted");
        setShouldRefetch((prev) => !prev);
      } catch (error: any) {
        console.error("Error deleting user:", error);
        toast.error("Failed to delete user");
      }
    }
  };

  const handleDeleteSecret = async (userId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this secret key?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      try {
        await axiosProvider.post(`/users/${userId}/reset-totp`, {});
        toast.success("Secret Key Deleted");
        
        // Update the user's totp_secret in the local data
        setData((prevData) => 
          prevData.map((user) => 
            user.id === userId 
              ? { ...user, totp_secret: null } 
              : user
          )
        );
        
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to delete secret");
      }
    }
  };

  const handleEditSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      await axiosProvider.put(`/users/${values.id}`, values);
      toast.success("User updated successfully!");
      setIsFlyoutOpen(false);
      setShouldRefetch((prev) => !prev);
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(error?.response?.data?.message || "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  const resetFlyout = () => {
    setIsFlyoutOpen(false);
    setSelectedUser(null);
  };

  if (isLoading) {
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
            {/* Create User Button */}
            <div className="w-full flex justify-end items-center mt-0 mb-8">
              <Link href="/useradd">
                <button className="flex items-center gap-[10px] h-12 px-3 py-[6px] rounded-[4px] shadow-borderShadow w-full sm:w-auto bg-primary-600 group hover:bg-primary-500">
                  <FaPlus className="h-[20px] w-[20px] text-white group-hover:text-white" />
                  <p className="text-white text-base leading-normal group-hover:text-white">
                    Create User
                  </p>
                </button>
              </Link>
            </div>

            <div className="relative overflow-x-auto sm:rounded-lg">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-[#999999]">
                  <tr className="border border-tableBorder">
                    <th scope="col" className="px-1 p-3 border border-tableBorder">
                      <div className="flex items-center gap-2">
                        <RxAvatar className="w-5 h-5" />
                        <div className="font-semibold text-firstBlack text-base leading-normal">
                          Name - Mail
                        </div>
                      </div>
                    </th>
                    <th scope="col" className="px-2 py-1 border border-tableBorder hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <MdOutlineCall className="w-5 h-5" />
                        <div className="font-semibold text-firstBlack text-base leading-normal">
                          Phone
                        </div>
                      </div>
                    </th>
                    <th scope="col" className="px-2 py-1 border border-tableBorder">
                      <div className="flex items-center gap-2">
                        <LiaArrowCircleDownSolid className="w-5 h-5" />
                        <div className="font-semibold text-firstBlack text-base leading-normal">
                          Action
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-4 border border-tableBorder">
                        <p className="text-[#666666] text-base">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    data.map((item: any, index: number) => (
                      <tr className="border border-tableBorder bg-white hover:bg-primary-100" key={item.id || index}>
                        <td className="px-1 md:p-3 py-2">
                          <div>
                            <p className="text-[#232323] text-sm font-semibold leading-normal mb-1 truncate">
                              {item.name}
                            </p>
                            <p className="text-[#232323] text-xs md:text-sm leading-normal truncate">
                              {item.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-2 py-1 border border-tableBorder hidden md:table-cell">
                          <p className="text-[#232323] text-sm leading-normal truncate">
                            {item.mobile_number}
                          </p>
                        </td>
                        <td className="px-2 py-1 border border-tableBorder">
                          <div className="flex gap-1 md:gap-2 justify-center md:justify-start">
                            {/* Edit Button */}
                            <button
                              onClick={() => handleEdit(item)}
                              className="py-[4px] px-3 bg-blue-500 hover:bg-blue-600 rounded-xl flex gap-1 items-center text-xs md:text-sm"
                              title="Edit User"
                            >
                              <MdModeEdit className="text-white w-4 h-4" />
                              <p className="text-white hidden md:block text-xs md:text-sm">
                                Edit
                              </p>
                            </button>
                            
                            {/* Delete Secret Button */}
                            <button
                              onClick={() => handleDeleteSecret(item.id)}
                              disabled={!item.totp_secret}
                              className={`py-[4px] px-3 rounded-xl flex gap-1 items-center text-xs md:text-sm ${
                                item.totp_secret 
                                  ? 'bg-amber-500 hover:bg-amber-600' 
                                  : 'bg-gray-400 cursor-not-allowed opacity-50'
                              }`}
                              title={item.totp_secret ? "Delete Secret Key" : "No Secret Key"}
                            >
                              <RiKey2Line className="text-white w-4 h-4" />
                              <p className="text-white hidden md:block text-xs md:text-sm">
                                Delete Secret
                              </p>
                            </button>
                            
                            {/* Delete User Button */}
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="py-[4px] px-3 bg-black hover:bg-red-600 rounded-xl flex gap-1 items-center text-xs md:text-sm"
                              title="Delete User"
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

          {/* Pagination */}
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
        </div>
      </div>

      {/* Dark BG */}
      {isFlyoutOpen && (
        <div
          className="min-h-screen w-full bg-[#1f1d1d80] fixed top-0 left-0 right-0 z-[999]"
          onClick={resetFlyout}
        ></div>
      )}

      {/* Flyout - Edit Mode */}
      <div className={`fixed top-0 right-0 w-[90%] md:w-[50%] h-full bg-white shadow-lg z-[1000] transition-all duration-300 ${isFlyoutOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto p-5`}>
        <div className="w-full">
          {/* Header */}
          <div className="flex justify-between mb-4">
            <p className="text-primary-600 text-[22px] md:text-[26px] font-bold">
              Edit User
            </p>
            <IoCloseOutline
              onClick={resetFlyout}
              className="h-8 w-8 border border-[#E7E7E7] text-[#0A0A0A] rounded cursor-pointer"
            />
          </div>
          <div className="w-full border-b border-[#E7E7E7] mb-4"></div>

          {/* Edit Form */}
          <Formik
            initialValues={{
              id: selectedUser?.id || "",
              name: selectedUser?.name || "",
              mobile_number: selectedUser?.mobile_number || "",
              email: selectedUser?.email || "",
            }}
            validationSchema={editValidationSchema}
            onSubmit={handleEditSubmit}
            enableReinitialize
          >
            {({ isSubmitting }: any) => (
              <Form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[#0A0A0A] font-medium text-base mb-2">Name</p>
                    <Field
                      type="text"
                      name="name"
                      className="w-full px-4 py-3 rounded border border-[#E7E7E7] focus:outline-none focus:ring-1 focus:ring-primary-600"
                      placeholder="Enter name"
                    />
                    <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div>
                    <p className="text-[#0A0A0A] font-medium text-base mb-2">Mobile</p>
                    <Field
                      type="text"
                      name="mobile_number"
                      className="w-full px-4 py-3 rounded border border-[#E7E7E7] focus:outline-none focus:ring-1 focus:ring-primary-600"
                      placeholder="Enter mobile number"
                    />
                    <ErrorMessage name="mobile_number" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-[#0A0A0A] font-medium text-base mb-2">Email</p>
                    <Field
                      type="email"
                      name="email"
                      className="w-full px-4 py-3 rounded border border-[#E7E7E7] focus:outline-none focus:ring-1 focus:ring-primary-600"
                      placeholder="Enter email"
                    />
                    <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                  </div>
                </div>

                <div className="mt-8 w-full flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-3 px-6 bg-primary-600 hover:bg-primary-500 rounded text-white font-medium disabled:opacity-50"
                  >
                    {isSubmitting ? "Updating..." : "Update User"}
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