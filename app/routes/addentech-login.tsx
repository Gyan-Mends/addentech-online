import {
    Checkbox,
    Input,
} from "@nextui-org/react";
import {
    Link,
    useNavigate
} from "@remix-run/react";
import {
    useEffect,
    useState
} from "react";
import { Mail, EyeOff, Eye } from "lucide-react";
import logo from "~/components/images/Dennislaw-Logo.svg"
import CustomInput from "~/components/ui/CustomInput";
import axios from "axios";

const Login = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [emailErrorMessage, setEmailErrorMessage] = useState("");
    const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        rememberMe: false
    });

    const handleVisibility = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setIsVisible(!isVisible);
    };

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Clear errors when user starts typing
        if (field === 'email') {
            setEmailError("");
            setEmailErrorMessage("");
        }
        if (field === 'password') {
            setPasswordError("");
            setPasswordErrorMessage("");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Clear previous errors
        setEmailError("");
        setPasswordError("");
        setEmailErrorMessage("");
        setPasswordErrorMessage("");

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("email", formData.email);
            formDataToSend.append("password", formData.password);
            formDataToSend.append("rememberMe", formData.rememberMe ? "on" : "off");

            const response = await axios.post("/api/auth/login", formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                // Redirect to the appropriate dashboard
                navigate(response.data.redirectUrl);
            }
        } catch (error: any) {
            if (error.response?.data) {
                const errorData = error.response.data;
                if (errorData.emailError) {
                    setEmailError(errorData.emailError.email);
                    setEmailErrorMessage(errorData.emailErrorMessage);
                }
                if (errorData.passwordError) {
                    setPasswordError(errorData.passwordError.password);
                    setPasswordErrorMessage(errorData.passwordErrorMessage);
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`flex flex-col justify-center items-center h-[100vh] w-full  overflow-y-hidden bg-white`}>
            {/* Logo */}
            <div className="h-[100vh] lg:w-[50vw] flex flex-col items-center justify-center">
                <div className="text-center mb-8">

                    <h1 className="text-2xl font-semibold mb-2 font-montserrat">WELCOME BACK</h1>
                    <p className="text-gray-500 italic font-nunito">A legal material portal</p>
                </div>

                <form onSubmit={handleSubmit} className=" flex flex-col gap-6">
                    <div>
                        <Input
                            name="email"
                            label="Email"
                            labelPlacement="outside"
                            placeholder="Enter your email "
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            endContent={<Mail className="text-xl text-default-400 " />}
                            className="placeholder:text-gray-300"
                        />
                        {emailError && (
                            <p className="text-danger font-nunito text-md mt-2">
                                {emailErrorMessage}
                            </p>
                        )}
                    </div>

                    <div>
                        <Input
                            name="password"
                            label="Password"
                            labelPlacement="outside"
                            type={isVisible ? "text" : "password"}
                            placeholder="Enter your password "
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className="placeholder:text-gray-300"
                            endContent={
                                <button
                                    type="button"
                                    className="focus:outline-none"
                                    onClick={handleVisibility}
                                >
                                    {isVisible ? (
                                        <EyeOff className="text-2xl text-default-400 pointer-events-none" />
                                    ) : (
                                        <Eye className="text-2xl text-default-400 pointer-events-none" />
                                    )}
                                </button>
                            }
                        />
                        {passwordError && (
                            <p className="text-danger font-nunito text-md mt-2">
                                {passwordErrorMessage}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-between mt-4 gap-4">
                        <Checkbox 
                            isSelected={formData.rememberMe}
                            onValueChange={(value) => handleInputChange('rememberMe', value)}
                        >
                            <p className="font-nunito text-sm ">Remember me</p>
                        </Checkbox>
                        <Link to="">
                            <p className="text-danger font-nunito text-sm">Forgot password?</p>
                        </Link>
                    </div>
                    <button
                        type="submit"
                        className="font-nunito bg-primary-500 hover:bg-primary-600  text-lg hover:transition hover:duration-500 hover:-translate-y-2 text-white w-full h-10 mt-10 rounded-xl"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Loggin in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
