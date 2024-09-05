
import BoxCut from "@/components/custom/boxCut/BoxCut";
import RouteProtectedAdmin from "@/middleware/RouteProtectedAdmin";
const BoxCutPage = () => {
    return (
        <RouteProtectedAdmin>
            <div className="w-full h-screen bg-[rgb(38,38,38)]">
                <BoxCut />
            </div>
        </RouteProtectedAdmin>

    );
}
export default BoxCutPage;