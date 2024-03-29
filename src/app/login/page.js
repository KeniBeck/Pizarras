import LoginForm from "@/components/custom/login/LoginFrom";
const Login = () =>{
    return(
    <div className="w-full h-screen items-center bg-center bg-no-repeat bg-[rgb(38,38,38)] flex-col">
        
       <div className="w-full h-full flex justify-center items-center  "> 
           
                <LoginForm />
           
        </div>
        
    </div>);

}
export default Login;