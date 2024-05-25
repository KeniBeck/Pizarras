import TicketBuySerial from "@/components/custom/ticketBuyEspecial/TickectBuyEspecial";
import RouteProtected from "@/middleware/RouteProtected";
const BuyTickectSerial = () => {

    return (
        <RouteProtected>
            <>

                <div className="w-full h-screen bg-[rgb(38,38,38)]">
                    <TicketBuySerial />
                </div>


            </>
        </RouteProtected>
    );

}
export default BuyTickectSerial;