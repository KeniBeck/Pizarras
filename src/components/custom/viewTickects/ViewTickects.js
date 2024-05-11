const ViewTickets = ()=>{

    return(
        
            <form className="max-w-md mx-auto"> 
                <div className="text-white text-lg flex justify-center items-center pt-6  pb-6">Vendidos:(num de boletos)</div>  
                <div className="relative ">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-red-600 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    <input type="search" className="block w-full p-4 ps-10 text-sm text-gray-900  rounded-lg bg-[rgba(240,88,88,0.73)] placeholder:text-white" placeholder="Busca el tickect que deseas.." required />
                    <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 ">Search</button>
                </div>
                

                <div className="relative overflow-x-auto shadow-md sm:rounded-lg pt-6">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-4 py-2">
                                    Num
                                </th>
                                <th scope="col" className="px-4 py-2">
                                    Boleto
                                </th>
                                <th scope="col" className="px-4 py-2">
                                    Precio
                                </th>
                                <th scope="col" className="px-4 py-2">
                                    Nombre
                                </th>
                                <th scope="col" className="px-4 py-2">
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    1
                                </th>
                                <td className="px-4 py-2">
                                    102
                                </td>
                                <td className="px-4 py-2">
                                    $30
                                </td>
                                <td className="px-4 py-2">
                                    Mena
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                                </td>
                            </tr>
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    2
                                </th>
                                <td className="px-4 py-2">
                                    101
                                </td>
                                <td className="px-4 py-2">
                                    $20
                                </td>
                                <td className="px-4 py-2">
                                    Andres
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                                </td>
                            </tr>
                            <tr className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    3
                                </th>
                                <td className="px-4 py-2">
                                    222
                                </td>
                                <td className="px-4 py-2">
                                    $10
                                </td>
                                <td className="px-4 py-2">
                                    Yefer
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </form>

    );
}
export default ViewTickets;