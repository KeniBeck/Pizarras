import WinnerTicket from "@/components/custom/winner/WinnerTicket"
import RouteProtectedWinner from "@/middleware/RouteProtectedWinner"


const WinningTicket = () => {
return(
    <RouteProtectedWinner>
        <div className="w-full h-screen bg-[rgb(38,38,38)]">
          <WinnerTicket />
        </div>
    </RouteProtectedWinner>
)
}
export default WinningTicket