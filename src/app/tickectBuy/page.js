'use client'
import TicketBuy from "@/components/custom/tickectBuy/TickectBuy";
import RouteProtected from "@/middleware/RouteProtected";

const BuyTicket = () => {


  return (
    <RouteProtected>
      <>
        <div className="w-full h-screen bg-[rgb(38,38,38)]">
          <TicketBuy />
        </div>

      </>
    </RouteProtected>
  );
}

export default BuyTicket;