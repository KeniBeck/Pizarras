import BoxCutLotery from "@/components/custom/boxCutLotery/BoxCutLotery";
import RouteProtectedWinner from "@/middleware/RouteProtectedWinner";

const Admin = () => {
    return (
        <RouteProtectedWinner>
            <div className="w-full min-h-screen items-center bg-center bg-no-repeat bg-[rgb(38,38,38)] flex-col">
                <div className="w-full h-full flex justify-center items-center  ">
                    <BoxCutLotery />
                </div>
            </div>
        </RouteProtectedWinner>
    )

}
export default Admin;