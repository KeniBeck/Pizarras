import ViewTickets from "@/components/custom/viewTickects/ViewTickects";

const ticketsView = () =>{

    return(
     <div className="w-full h-screen items-center bg-center bg-no-repeat bg-[rgb(38,38,38)] flex-col">
        
        <div className="w-full bg-[rgb(38,38,38)]">
            <ViewTickets/>
        </div>
      </div>
    );
}
export default ticketsView;