"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AxiosProvider from "../provider/AxiosProvider";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";

export default function LoginHome() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const axiosProvider = new AxiosProvider();

const validationSchema = Yup.object({
  email: Yup.string().required("Email is required"),
  password: Yup.string().required("Password is required"),
});

  const handleSubmitLogin = async (values: any, { setSubmitting }) => {
    try {
      const res = await axiosProvider.post("/login", {
        email: values.email,
        password: values.password,
      });
   
      if (res.success) {
        localStorage.setItem('userId', res.data.userId);
        localStorage.setItem('userEmail', res.data.email);
        localStorage.setItem('userName', res.data.name);
        
        if (res.data.hasTotp) {
          router.push("/totp");
        } else {
          router.push("/qrcode");
        }
      } else {
        toast.error(res.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="bg-[#F5F5F5] hidden md:block fixed inset-0">
        <Image
          src="/images/orizon-login-bg.svg"
          alt="Orizon iconLogo bg"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute top-20 left-28 w-[100px] h-[80px]">
          <Image
            src="/images/compressIcon.svg"
            alt="OrizonIcon"
            fill
            className="object-contain"
          />
        </div>

        <div className="absolute top-32 right-28 w-[100px] h-[80px]">
          <Image
            src="/images/compressIcon.svg"
            alt="OrizonIcon"
            fill
            className="object-contain"
          />
        </div>

        <div className="absolute top-[60%] left-[17%] -translate-y-1/2 w-[100px] h-[80px]">
          <Image
            src="/images/compressIcon.svg"
            alt="OrizonIcon"
            fill
            className="object-contain"
          />
        </div>

        <div className="absolute top-[65%] right-[17%] -translate-y-1/2 w-[100px] h-[80px]">
          <Image
            src="/images/compressIcon.svg"
            alt="OrizonIcon"
            fill
            className="object-contain"
          />
        </div>

        <div className="absolute top-[98%] left-0 right-0 mx-auto -translate-y-1/2 w-[100px] h-[80px]">
          <Image
            src="/images/compressIcon.svg"
            alt="OrizonIcon"
            fill
            className="object-contain"
          />
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-[90%] max-w-[500px] max-h-[587px] shadow-loginBoxShadow bg-white px-6 sm:px-12 py-10 sm:py-16 rounded-lg">
          <div className="relative mx-auto mb-5 w-[150px] h-[100px]">
            <Image
              src="/images/compressIcon.svg"
              alt="OrizonIcon"
              fill
              className="object-contain"
            />
          </div>

          <p className="font-bold text-lg sm:text-base leading-normal text-center text-black mb-6">
            Login
          </p>

          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmitLogin}
          >
            {({ isSubmitting, setFieldValue }) => (
              <Form className="w-full">
                <div className="w-full">
                  <p className="text-[#232323] text-base leading-normal mb-2">
                    Email
                  </p>
                  <div className="relative">
                    <Field
                      type="text"
                      name="email"
                      autoComplete="username"
                      placeholder="Enter your email"
                      className="focus:outline-none w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-7 text-[#718EBF] hover:shadow-hoverInputShadow focus:border-primary-500"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm absolute top-14"
                    />
                  </div>

                  <p className="text-[#232323] text-base leading-normal mb-2">
                    Password
                  </p>
                  <div className="relative">
                    <Field
                      type={showPassword ? "text" : "password"}
                      name="password"
                      onChange={(e) => setFieldValue("password", e.target.value)}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="focus:outline-none w-full h-[50px] border border-[#DFEAF2] rounded-[4px] text-[15px] placeholder-[#718EBF] pl-4 mb-8 text-[#718EBF] hover:shadow-hoverInputShadow focus:border-primary-500"
                    />
                    {showPassword ? (
                      <FaRegEye
                        onClick={togglePasswordVisibility}
                        className="absolute top-4 right-4 text-[#718EBF] text-[15px] cursor-pointer"
                      />
                    ) : (
                      <FaRegEyeSlash
                        onClick={togglePasswordVisibility}
                        className="absolute top-4 right-4 text-[#718EBF] text-[15px] cursor-pointer"
                      />
                    )}
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-sm absolute top-14"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary-600 rounded-[4px] w-full h-[50px] text-center text-white text-lg font-medium leading-normal mb-3 hover:bg-primary-500 active:bg-primary-700 transition duration-100 disabled:opacity-50"
                  >
                    {isSubmitting ? "Logging in..." : "Login"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}