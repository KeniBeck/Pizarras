import LoginForm from "@/components/custom/login/LoginFrom";
const Login = () =>{
    return(
    <div className="w-full h-screen bg-[#373637] flex-col">
        
        <div className="flex justify-center"></div>
       <div className="w-full h-screen flex justify-center  "> 
            <div className=" w-full  flex justify-center items-center md:w-1/2">
                <LoginForm />
            </div>
        </div>
        
    </div>);

}
export default Login;