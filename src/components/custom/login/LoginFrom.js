import { FaUserCircle } from "react-icons/fa";
import { PiPasswordFill } from "react-icons/pi";

const LoginForm = () =>{
    return(


        <form className="max-w-sm mx-auto w-full ">
            <div className="flex justify-center mb-10 text-2xl text-white">(logo)</div>
            <div className="mb-6 text-white flex justify-center items-center">Bienvenido</div>
          <div className="relative z-0 w-full px-8 mb-5 group">
          <div className="relative">
            <input type="email"   className="block py-2.5 px-0 w-full text-sm  text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-red-500 focus:outline-none focus:ring-0 relative pl-12" placeholder=" Usuario" required />
          <FaUserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 text-gray-500 " />
            </div>
         <div className="relative ">
              <input type="password"   className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-red-500 focus:outline-none focus:ring-0 pl-12" placeholder=" Password" required />
              <PiPasswordFill className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 text-gray-500 " />
         </div>
         </div>
         <div className=" relative z-0 px-8 ">
          <button type="submit" className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-full px-5 py-2.5 text-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">Ingresar</button>
        </div>        
        </form>
        );

}
export default LoginForm;