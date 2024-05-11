'use client'
import { FaUserCircle } from "react-icons/fa";
import { PiPasswordFill } from "react-icons/pi";
import { useForm } from "react-hook-form"
import useSession from "@/hook/useSession";
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'

const LoginForm = () => {
  const { login } = useSession();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const enviarDatos = async (dataUser) => {

    const options = {
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataUser)
    }
    await fetch("/api/login", options)
      .then(res => res.json())
      .then(data => processData(data))


  }
  const processData = (data) => {
    let time = data[0].requestTime.indexOf('T') > 0 ? data[0].requestTime.split('T')[1].split('.')[0] : data[0].requestTime;
    let hour = parseInt(time.split(':')[0]);
    //hour < 18 && hour >= 8
    if (hour <= 18 && hour >= 8) {
      // Redirige al usuario a la página del menú
      login(data[0])
      localStorage.setItem('userData', JSON.stringify(data[0]));
      router.push('/menu')

    } else {
      // Muestra un mensaje de error
      error();
    }

  }
  const error = () => {
    Swal.fire({
      position: 'top-center',
      title: 'Error',
      text: 'SORTEO CERRADO',
      icon: 'error',
      showConfirmButton: false,
      timer: 2500
    })
  }

  return (


    <form onSubmit={handleSubmit(enviarDatos)} className="max-w-sm mx-auto w-full ">
      <div className="flex justify-center -mt-10 text-2xl text-white ">
        <img src="/noSencillo.png" alt="Logo" className="w-full h-[132px]" />
      </div>
      <div className="mb-6 text-white flex justify-center items-center">Bienvenido</div>
      <div className="relative z-0 w-full px-8 mb-5 group">
        <div className="relative">
          <input {...register("user", { required: true })} className=" block py-2.5 px-0 w-full text-sm  text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-red-500 focus:outline-none focus:ring-0 relative pl-12" placeholder=" Usuario" required />
          <FaUserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 text-gray-500 " />
        </div>
        <div className="relative ">
          <input {...register("pass", { required: true })} type="password" className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-red-500 focus:outline-none focus:ring-0 pl-12" placeholder=" Password" required />
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