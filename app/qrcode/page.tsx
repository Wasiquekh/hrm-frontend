"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Formik, Form } from "formik";
import AxiosProvider from "../../provider/AxiosProvider";
import OtpInput from "react-otp-input";

const axiosProvider = new AxiosProvider();

export default function QrCodePage() {
  const router = useRouter();
  const [qrCode, setQrCode] = useState("");
  const [otpValue, setOtpValue] = useState("");

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  useEffect(() => {
    if (!userId) {
      router.push('/');
      return;
    }
    generateQR();
  }, []);

  const generateQR = async () => {
    try {
      const res = await axiosProvider.post("/generate-qr", {
        userId: userId
      });
      
      if (res.success) {
        setQrCode(res.data.qrCode);
        localStorage.setItem('tempSecret', res.data.secretKey);
      }
    } catch (error) {
      toast.error("Failed to generate QR");
      router.push('/');
    }
  };

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
        token: values.otp,
        secretKey: localStorage.getItem('tempSecret')
      });

      if (res.success) {
        localStorage.setItem('accessToken', res.data.token);
        localStorage.removeItem('tempSecret');
        localStorage.setItem('hasTotp', 'true');
        toast.success("Setup completed successfully!");
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error("Invalid code. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="bg-[#F5F5F5] hidden md:block fixed inset-0">
        <Image
          src="/images/orizon-login-bg.svg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute top-20 left-28 w-[100px] h-[80px]">
          <Image src="/images/compressIcon.svg" alt="Logo" fill className="object-contain" />
        </div>
        <div className="absolute top-32 right-28 w-[100px] h-[80px]">
          <Image src="/images/compressIcon.svg" alt="Logo" fill className="object-contain" />
        </div>
        <div className="absolute top-[60%] left-[17%] -translate-y-1/2 w-[100px] h-[80px]">
          <Image src="/images/compressIcon.svg" alt="Logo" fill className="object-contain" />
        </div>
        <div className="absolute top-[65%] right-[17%] -translate-y-1/2 w-[100px] h-[80px]">
          <Image src="/images/compressIcon.svg" alt="Logo" fill className="object-contain" />
        </div>
        <div className="absolute top-[98%] left-0 right-0 mx-auto -translate-y-1/2 w-[100px] h-[80px]">
          <Image src="/images/compressIcon.svg" alt="Logo" fill className="object-contain" />
        </div>
      </div>

      <div className="absolute top-0 bottom-0 left-0 right-0 mx-auto my-auto w-[90%] max-w-[500px] h-auto min-h-[587px] shadow-loginBoxShadow bg-white px-6 sm:px-12 py-10 sm:py-16 rounded-lg flex flex-col justify-center items-center">
        <div className="relative mx-auto mb-5 w-[150px] h-[100px]">
          <Image src="/images/compressIcon.svg" alt="Logo" fill className="object-contain" />
        </div>

        <p className="font-bold text-lg sm:text-base leading-normal text-center text-black mb-2">
          Setup Google Authenticator
        </p>
        
        {qrCode && (
          <div className="flex justify-center mb-6">
            <Image src={qrCode} alt="QR Code" width={200} height={200} />
          </div>
        )}
        
        <p className="text-[#232323] text-base leading-[26px] text-center mb-10 sm:mb-14">
          Scan QR code with Google Authenticator app
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 rounded-[4px] w-full h-[50px] text-center text-white text-lg font-medium leading-normal mb-3 hover:bg-primary-500 active:bg-primary-700 disabled:opacity-50"
              >
                {isSubmitting ? "Verifying..." : "Verify & Continue"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}