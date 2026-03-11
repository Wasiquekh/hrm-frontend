"use client";
import Link from "next/link";
import Image from "next/image";
import { 
  MdOutlineDashboard,
} from "react-icons/md";
import { 
  TbCategoryFilled, 
  TbDeviceMobileDollar 
} from "react-icons/tb";
import { HiWrenchScrewdriver } from "react-icons/hi2";
import {  FaMoneyCheckDollar } from "react-icons/fa6";
import { FaBuilding, FaCalendarCheck, FaIdBadge, FaUserEdit } from "react-icons/fa";
import { BsCreditCard2Back } from "react-icons/bs";
import { IoMdSettings } from "react-icons/io";
import { RiHistoryLine } from "react-icons/ri";
import { usePathname, useRouter } from "next/navigation";

const LeftSideBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    localStorage.clear();
    try {
      // Uncomment when API is ready
      // const response = await axiosProvider.post("/fineengg_erp/logout", {});
      window.location.href = "/";
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="w-full hidden md:w-[17%] md:flex flex-col justify-between py-4 px-1 border-r-2 border-customBorder shadow-borderShadow mt-0 h-screen fixed top-0 left-0">
      {/* SIDE LEFT BAR TOP SECTION */}
      <div className="z-10 overflow-y-auto custom-scrollbar">
        <Link href="/dashboard">
          <div className="flex gap-2 mb-12 px-0 py-2">
            <Image
              src="/images/fine-engineering-logo.jpeg"
              alt="Description of image"
              width={500}
              height={500}
              className="w-full h-auto"
            />
          </div>
        </Link>
        
        {/* MENU WITH ICONS */}
        <Link href="/dashboard">
          <div
            className={`mb-4 flex gap-4 items-center group px-3 py-2 rounded-[4px] relative cursor-pointer text-base leading-normal font-medium text-firstBlack hover:bg-sideBarHoverbg active:bg-sideBarHoverbgPressed hover:text-primary-600 ${
              pathname === "/dashboard"
                ? "bg-primary-600 text-white hover:!bg-primary-600 hover:!text-white"
                : ""
            }`}
          >
            <MdOutlineDashboard className="w-6 h-6" />
            <p>Dashboard</p>
          </div>
        </Link>

        <Link href="/attendance">
          <div
            className={`mb-4 flex gap-4 items-center group px-3 py-2 rounded-[4px] relative cursor-pointer text-base leading-normal font-medium text-firstBlack hover:bg-sideBarHoverbg active:bg-sideBarHoverbgPressed hover:text-primary-600 ${
              pathname === "/attendance"
                ? "bg-primary-600 text-white hover:!bg-primary-600 hover:!text-white"
                : ""
            }`}
          >
            <FaCalendarCheck   className="w-6 h-6" />
            <p>Attendance</p>
          </div>
        </Link>


        <Link href="/departments">
          <div
            className={`mb-4 flex gap-4 items-center group px-3 py-2 rounded-[4px] relative cursor-pointer text-base leading-normal font-medium text-firstBlack hover:bg-sideBarHoverbg active:bg-sideBarHoverbgPressed hover:text-primary-600 ${
              pathname === "/departments"
                ? "bg-primary-600 text-white hover:!bg-primary-600 hover:!text-white"
                : ""
            }`}
          >
            <FaBuilding    className="w-6 h-6" />
            <p>Departments</p>
          </div>
        </Link>
                 <Link href="/designation">  

          <div
            className={`mb-4 flex gap-4 items-center group px-3 py-2 rounded-[4px] relative cursor-pointer text-base leading-normal font-medium text-firstBlack hover:bg-sideBarHoverbg active:bg-sideBarHoverbgPressed hover:text-primary-600 ${
              pathname === "/designation"
                ? "bg-primary-600 text-white hover:!bg-primary-600 hover:!text-white"
                : ""
            }`}
          >
            <FaIdBadge     className="w-6 h-6" />
            <p>Designation</p>
          </div>
        </Link>

        <Link href="/transaction">
          <div
            className={`mb-4 flex gap-4 items-center group px-3 py-2 rounded-[4px] relative cursor-pointer text-base leading-normal font-medium text-firstBlack hover:bg-sideBarHoverbg active:bg-sideBarHoverbgPressed hover:text-primary-600 ${
              pathname === "/transaction"
                ? "bg-primary-600 text-white hover:!bg-primary-600 hover:!text-white"
                : ""
            }`}
          >
            <TbDeviceMobileDollar className="w-6 h-6" />
            <p>Transaction</p>
          </div>
        </Link>

        <Link href="/point-of-services">
          <div
            className={`mb-4 flex gap-4 items-center group px-3 py-2 rounded-[4px] relative cursor-pointer text-base leading-normal font-medium text-firstBlack hover:bg-sideBarHoverbg active:bg-sideBarHoverbgPressed hover:text-primary-600 ${
              pathname === "/point-of-services"
                ? "bg-primary-600 text-white hover:!bg-primary-600 hover:!text-white"
                : ""
            }`}
          >
            <HiWrenchScrewdriver className="w-6 h-6" />
            <p>Point of Services</p>
          </div>
        </Link>

        <Link href="/payment-terminal">
          <div
            className={`mb-4 flex gap-4 items-center group px-3 py-2 rounded-[4px] relative cursor-pointer text-base leading-normal font-medium text-firstBlack hover:bg-sideBarHoverbg active:bg-sideBarHoverbgPressed hover:text-primary-600 ${
              pathname === "/payment-terminal"
                ? "bg-primary-600 text-white hover:!bg-primary-600 hover:!text-white"
                : ""
            }`}
          >
            <FaMoneyCheckDollar className="w-6 h-6" />
            <p>Payment Terminal</p>
          </div>
        </Link>

        <Link href="/cards">
          <div
            className={`mb-4 flex gap-4 items-center group px-3 py-2 rounded-[4px] relative cursor-pointer text-base leading-normal font-medium text-firstBlack hover:bg-sideBarHoverbg active:bg-sideBarHoverbgPressed hover:text-primary-600 ${
              pathname === "/cards"
                ? "bg-primary-600 text-white hover:!bg-primary-600 hover:!text-white"
                : ""
            }`}
          >
            <BsCreditCard2Back className="w-6 h-6" />
            <p>Credit Cards</p>
          </div>
        </Link>

        <Link href="/usermanagement">
          <div
            className={`mb-4 flex gap-4 items-center group px-3 py-2 rounded-[4px] relative cursor-pointer text-base leading-normal font-medium text-firstBlack hover:bg-sideBarHoverbg active:bg-sideBarHoverbgPressed hover:text-primary-600 ${
              pathname === "/usermanagement" || pathname === "/useradd"
                ? "bg-primary-600 text-white hover:!bg-primary-600 hover:!text-white"
                : ""
            }`}
          >
            <FaUserEdit className="w-6 h-6" />
            <p>User Management</p>
          </div>
        </Link>



        <Link href="/setting">
          <div
            className={`mb-4 flex gap-4 items-center group px-3 py-2 rounded-[4px] relative cursor-pointer text-base leading-normal font-medium text-firstBlack hover:bg-sideBarHoverbg active:bg-sideBarHoverbgPressed hover:text-primary-600 ${
              pathname === "/setting"
                ? "bg-primary-600 text-white hover:!bg-primary-600 hover:!text-white"
                : ""
            }`}
          >
            <IoMdSettings className="w-6 h-6" />
            <p>Setting</p>
          </div>
        </Link>
      </div>
      {/* END SIDE LEFT BAR TOP SECTION */}

      {/* SIDE LEFT BAR BOTTOM SECTION */}
      <div className="flex gap-2 items-center px-3 py-2 z-10">
        <div>
          <Image
            src="/images/logoutIcon.svg"
            alt="logout Icon"
            width={24}
            height={24}
          />
        </div>
        <div
          className="text-base font-semibold leading-normal text-[#EB5757] cursor-pointer"
          onClick={handleLogout}
        >
          Logout
        </div>
      </div>
      {/* END SIDE LEFT BAR BOTTOM SECTION */}
      
      <Image
        src="/images/sideBarDesign.svg"
        alt="logout Icon"
        width={100}
        height={100}
        className="w-full absolute bottom-0 right-0 -mb-24"
      />
    </div>
  );
};

export default LeftSideBar;