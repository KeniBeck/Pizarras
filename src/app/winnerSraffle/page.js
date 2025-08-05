import WinnerSraffle from "@/components/custom/winnerSraffle/winnerStra/WinnerSraffle";
import RouteProtectedWinner from "@/middleware/RouteProtectedWinner"


const WinningSraffle = () => {
return(
    <RouteProtectedWinner>
        <div className="w-full h-screen bg-[rgb(38,38,38)]">
            <WinnerSraffle />
        </div>
    </RouteProtectedWinner>
)
}
export default WinningSraffle;