'use client'
import ViewMenu from "@/components/custom/menu/ViewMenu";
import RouteProtected from "@/middleware/RouteProtected";




const Menu = () => {


    return (
        <RouteProtected>
            <>
                <div className="w-full h-screen bg-[rgb(38,38,38)] flex-col">
                    <ViewMenu />
                </div>
            </>
        </RouteProtected>
    );
}
export default Menu;