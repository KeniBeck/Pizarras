import TypeDraw from "@/components/custom/typeDraw/TypeDraw";
import RouteProtected from "@/middleware/RouteProtected";


const Type = () => {

    return (
        <RouteProtected>
            <>
                <div className="w-full h-screen bg-[rgb(38,38,38)] flex-col flex justify-center items-center">
                    <div className="w-full h-full flex justify-center items-center  ">
                        <TypeDraw />
                    </div>

                </div>
            </>
        </RouteProtected>
    )

}
export default Type;