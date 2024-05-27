import ViewAwards from "@/components/custom/viewAwardedTickets/ViewAwards";
import RouteProtected from "@/middleware/RouteProtected";

const awardsTicketsView = () => {
    return (
        <RouteProtected>
            <>
                <div className="w-full h-screen items-center bg-center bg-no-repeat bg-[rgb(38,38,38)] flex-col">
                    <div className="w-full bg-[rgb(38,38,38)]">
                        <ViewAwards />
                    </div>
                </div>
            </>
        </RouteProtected>
    );

}
export default awardsTicketsView;