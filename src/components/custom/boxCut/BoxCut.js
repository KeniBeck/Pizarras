"use client";
import { useEffect, useState } from "react";
import useSession from "@/hook/useSession";
import { printBoxCut } from "../alerts/menu/Alerts";
import { useRouter } from "next/navigation";
import { FaHome } from "react-icons/fa";
import Swal from "sweetalert2";
import updateInfo from "../validation/updateInfo";

const BoxCut = () => {
  const [userData, setUserData] = useState(null);
  const router = useRouter();
  const backgroundImage = "/Sencillo.png";

 
  useEffect(() => {
    if (typeof window !== "undefined") {
      const localUserData = JSON.parse(localStorage.getItem("userData"));
      setUserData(localUserData);
    }
  }, []);

  const handelPrintCu = () => {
    printBoxCut(userData);
  };
  const goToMenu = () => {
    updateInfo(userData.Idvendedor).then(()=>{
      router.push("/menu");
      localStorage.removeItem("loggedAdmin");
    })
  };

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="bg-black opacity-50 absolute inset-0"></div>
      </div>
      <div className="max-w-sm mx-auto w-full bg-[rgb(38,38,38)] relative z-10">
        {handelPrintCu()}
      </div>
      <button
        onClick={goToMenu}
        className="fixed bottom-4 right-4 bg-red-700 text-white flex justify-center items-center text-4xl p-2 rounded-full h-[80px] w-[80px] z-10"
      >
        <FaHome />
      </button>
    </div>
  );
};
export default BoxCut;
