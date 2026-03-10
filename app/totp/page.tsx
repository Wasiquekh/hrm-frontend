"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import AxiosProvider from "../../provider/AxiosProvider";
import OtpInput from "react-otp-input";

const axiosProvider = new AxiosProvider();

export default function TotpPage() {
  const router = useRouter();
  const [otpValue, setOtpValue] = useState("");

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  useEffect(() => {
    if (!userId) {
      router.push('/');
    }
  }, []);

  const validateOtp = (value: string) => {
    if (!value || value.length === 0) {
      toast.error("Please enter OTP code");
      return false;
    }
    if (value.length < 6) {
      toast.error("OTP must be 6 digits");
      return false;
    }
    return true;
  };

  const handleSubmit = async (values: { otp: string }, { setSubmitting }: any) => {
    if (!validateOtp(values.otp)) {
      setSubmitting(false);
      return;
    }

    try {
      const res = await axiosProvider.post("/verify-totp", {
        userId: userId,
        token: values.otp
      });

      if (res.success) {
        localStorage.setItem('accessToken', res.data.token);
        toast.success("Login successful!");
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid Code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="bg-[#F5F5F5] hidden md:block fixed inset-0">
        <Image
          src="/images/orizon-login-bg.svg"
          alt="Orizon iconLogo bg"
          fill
          className="object-cover"
          priority
        />
        
        <div className="absolute top-20 left-28 w-[100px] h-[80px]">
          <Image src="/images/compressIcon.svg" alt="OrizonIcon" fill className="object-contain" />
        </div>
        
        <div className="absolute top-32 right-28 w-[100px] h-[80px]">
          <Image src="/images/compressIcon.svg" alt="OrizonIcon" fill className="object-contain" />
        </div>
        
        <div className="absolute top-[60%] left-[17%] -translate-y-1/2 w-[100px] h-[80px]">
          <Image src="/images/compressIcon.svg" alt="OrizonIcon" fill className="object-contain" />
        </div>
        
        <div className="absolute top-[65%] right-[17%] -translate-y-1/2 w-[100px] h-[80px]">
          <Image src="/images/compressIcon.svg" alt="OrizonIcon" fill className="object-contain" />
        </div>
        
        <div className="absolute top-[98%] left-0 right-0 mx-auto -translate-y-1/2 w-[100px] h-[80px]">
          <Image src="/images/compressIcon.svg" alt="OrizonIcon" fill className="object-contain" />
        </div>
      </div>

      <div className="absolute top-0 bottom-0 left-0 right-0 mx-auto my-auto w-[90%] max-w-[500px] h-[587px] shadow-loginBoxShadow bg-white px-6 sm:px-12 py-10 sm:py-16 rounded-lg overflow-y-auto flex flex-col justify-center items-center">
        <div className="relative mx-auto mb-5 w-[150px] h-[100px]">
          <Image src="/images/compressIcon.svg" alt="OrizonIcon" fill className="object-contain" />
        </div>

        <p className="font-bold text-lg sm:text-base leading-normal text-center text-black mb-2">
          Authenticate your Account
        </p>
        
        <p className="text-[#232323] text-base leading-[26px] text-center mb-10 sm:mb-14">
          Please confirm your account by entering the authentication number sent
          to your authenticator app
        </p>
        
        <Formik
          initialValues={{ otp: "" }}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue }) => (
            <Form className="w-full">
              <div className="flex items-center justify-between mb-10 sm:mb-14 w-[96%] mx-auto">
                <OtpInput
                  value={otpValue}
                  onChange={(val) => {
                    setOtpValue(val);
                    setFieldValue("otp", val);
                  }}
                  numInputs={6}
                  shouldAutoFocus
                  inputType="tel"
                  containerStyle={{ display: "contents" }}
                  renderInput={(props, index) => (
                    <input
                      {...props}
                      key={index}
                      className="!w-[14%] md:!w-[55px] h-12 sm:h-14 py-3 sm:py-4 text-center sm:px-5 border-b border-[#BDD1E0] text-black text-lg sm:text-xl font-semibold leading-normal focus:outline-none focus:border-b-2 focus-within:border-primary-500"
                    />
                  )}
                />
              </div>

              <div className="w-full">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary-600 border rounded-[4px] w-full h-[50px] text-center text-white text-lg font-medium leading-normal mb-3 hover:bg-primary-500 active:bg-primary-700 disabled:opacity-50"
                >
                  {isSubmitting ? "Code Verifying..." : "Verify Code"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}