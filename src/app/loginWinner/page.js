import LoginAdmin from "@/components/custom/login/LoginAdmin";
import LoginWinner from "@/components/custom/login/LoginWinner";

const Admin = () => {
    return (
        <div className="w-full h-screen items-center bg-center bg-no-repeat bg-[rgb(38,38,38)] flex-col">
            <div className="w-full h-full flex justify-center items-center  ">
                <LoginWinner />
            </div>
        </div>
    )

}
export default Admin;