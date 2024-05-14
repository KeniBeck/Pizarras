import TicketBuy from "@/components/custom/tickectBuy/TickectBuy";
import RouteProtected from "@/middleware/RouteProtected";

const buyTicket = () => {

  return (
    <RouteProtected>
      <>
        <div className="w-full h-screen items-center bg-center bg-no-repeat bg-[rgb(38,38,38)] flex-col">
          <div className="w-full bg-[rgb(38,38,38)]"><TicketBuy /></div>


        </div>
      </>
    </RouteProtected>
  );
}
export default buyTicket;