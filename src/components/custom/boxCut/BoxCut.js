'use client'
import { useEffect, useState } from "react";
import useSession from "@/hook/useSession";
import { printBoxCut } from "../alerts/menu/Alerts";

const BoxCut = () => {
    const { getUserData } = useSession();
    const [userData, setUserData] = useState(null);
    const [boxCut, setBoxCut] = useState([]);
    const fetchData = async () => {
        try {
            const userData = getUserData();
            setUserData(userData);


            const response = await fetch('/api/boxCut', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setBoxCut(data);

        } catch (error) {
            console.log(error);
        }
    }


    useEffect(() => {
        if (typeof window !== 'undefined') {
            const localUserData = JSON.parse(sessionStorage.getItem('userData'));
            setUserData(localUserData);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, []);
    if (boxCut.length === 0) {
        return (<div className="flex justify-center items-center min-h-screen">
            <div className="relative w-32 h-32">
                <div className="absolute top-0 left-0 animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500"></div>
                <div className="absolute top-0 left-0 flex items-center justify-center h-32 w-32">
                    <span className="text-white text-sm">Cargando...</span>
                </div>
            </div>
        </div>);
    }
    // console.log(boxCut);
    const handelPrintCu = (data) => {
        printBoxCut(data);
    }

    return (
        <div className="relative min-h-screen">
            <div className="max-w-sm mx-auto w-full bg-[rgb(38,38,38)]">
                {handelPrintCu(boxCut)}
            </div>
        </div>
    );

}
export default BoxCut;