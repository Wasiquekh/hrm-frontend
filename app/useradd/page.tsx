"use client";
import Image from "next/image";
import Tabs from "../component/Tabs";
import { CiSettings } from "react-icons/ci";
import { IoIosNotificationsOutline } from "react-icons/io";
import { useEffect, useState } from "react";
import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  FormikHelpers,
} from "formik";
import * as Yup from "yup";
import AxiosProvider from "../../provider/AxiosProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import LeftSideBar from "../component/LeftSideBar";
import UserActivityLogger from "../../provider/UserActivityLogger";
import DesktopHeader from "../component/DesktopHeader";
import { useAuthRedirect } from "../component/hooks/useAuthRedirect";
import { useRouter } from "next/navigation";

const axiosProvider = new AxiosProvider();

interface FormValues {
  name: string;
  mobile_number: string;
  email: string;
  password: string;
}

// Validation Schema - Simple mobile number (10 digits)
const validationSchema = Yup.object().shape({
  name: Yup.string().required("Your name is required"),
  mobile_number: Yup.string()
    .matches(/^[0-9]{10}$/, "Mobile number must be 10 digits")
    .required("Mobile number is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function CreateUserPage() {
  useAuthRedirect();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (
    values: FormValues,
    { resetForm, setSubmitting }: FormikHelpers<FormValues>
  ) => {
    try {
      console.log("Submitting:", values);
      const res = await axiosProvider.post("/users", values);

      if (res.success) {
        toast.success("User created successfully!");
        resetForm();
        
        try {
          const activityLogger = new UserActivityLogger();
          await activityLogger.userRegister(res.user?.id || res.data?.user?.id);
        } catch (logError) {
          console.log("Activity logging failed:", logError);
        }

        setTimeout(() => {
          router.push("/usermanagement");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Error creating user:", error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create user");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    {
      label: "Create New User",
      content: (
        <div className="flex gap-8 pt-3 flex-col md:flex-row">
          <Formik
            initialValues={{
              name: "",
              mobile_number: "",
              email: "",
              password: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, isSubmitting, values }) => (
              <Form className="w-full md:w-9/12">
                <div className="w-full">
                  {/* Name and Mobile Fields */}
                  <div className="w-full flex flex-col md:flex-row gap-6">
                    {/* Name Field */}
                    <div className="w-full relative mb-3">
                      <p className="text-[#232323] text-base leading-normal mb-2">
                        Your Name
                      </p>
                      <Field
                        type="text"
                        name="name"
                        placeholder="Charlene Reed"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                      />
                      <ErrorMessage
                        name="name"
                        component="div"
                        className="text-red-500 absolute top-[90px] text-xs"
                      />
                    </div>

                    {/* Mobile Number Field - Simple Input (No Package) */}
                    <div className="w-full relative mb-3">
                      <p className="text-[#232323] text-base leading-normal mb-2">
                        Mobile Number
                      </p>
                      <Field
                        type="tel"
                        name="mobile_number"
                        placeholder="9876543210"
                        maxLength={10}
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFieldValue("mobile_number", value);
                        }}
                      />
                      <ErrorMessage
                        name="mobile_number"
                        component="div"
                        className="text-red-500 absolute top-[90px] text-xs"
                      />
                    </div>
                  </div>

                  {/* Email and Password Fields */}
                  <div className="w-full flex flex-col md:flex-row gap-6">
                    <div className="w-full relative mb-3">
                      <p className="text-[#232323] text-base leading-normal mb-2">
                        Email
                      </p>
                      <Field
                        type="email"
                        name="email"
                        placeholder="Janedoe@gmail.com"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-red-500 absolute top-[90px] text-xs"
                      />
                    </div>

                    <div className="w-full relative mb-3">
                      <p className="text-[#232323] text-base leading-normal mb-2">
                        Password
                      </p>
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="********"
                        className="hover:shadow-hoverInputShadow focus-border-primary w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-2 text-firstBlack"
                      />
                      {showPassword ? (
                        <FaRegEye
                          onClick={togglePasswordVisibility}
                          className="absolute top-12 right-4 text-[#718EBF] text-[15px] cursor-pointer"
                        />
                      ) : (
                        <FaRegEyeSlash
                          onClick={togglePasswordVisibility}
                          className="absolute top-12 right-4 text-[#718EBF] text-[15px] cursor-pointer"
                        />
                      )}
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="text-red-500 absolute top-[90px] text-xs"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="w-full mt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-[50px] bg-primary-600 rounded-[4px] text-white text-lg leading-normal font-medium hover:bg-primary-500 disabled:opacity-50"
                    >
                      {isSubmitting ? "Creating User..." : "Create User"}
                    </button>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
          <ToastContainer />
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end min-h-screen">
        <LeftSideBar />
        <div className="w-full md:w-[83%] min-h-[500px] rounded p-4 bg-[#F5F7FA] relative">
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
          
          <div className="w-full bg-[#F5F7FA] flex justify-center relative">
            <div className="w-full min-h-[600px] bg-white rounded-[25px]">
              <div className="p-2 md:p-6">
                <Tabs tabs={tabs} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}