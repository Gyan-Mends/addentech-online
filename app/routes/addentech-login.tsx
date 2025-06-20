import {
    Checkbox,
    Input,
} from "@nextui-org/react";
import {
    ActionFunction,
    json
} from "@remix-run/node";
import {
    Form,
    Link,
    useActionData,
    useNavigation
} from "@remix-run/react";
import {
    useEffect,
    useState
} from "react";
import { Mail, EyeOff, Eye } from "lucide-react";
import logo from "~/components/images/Dennislaw-Logo.svg"
import CustomInput from "~/components/ui/CustomInput";

import login from "~/controller/login";

const Login = () => {
    const actionData = useActionData<any>();
    const [isVisible, setIsVisible] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const navigation = useNavigation();

    const isSubmitting = navigation.state === "submitting";

    useEffect(() => {
        if (actionData) {
            setEmailError(actionData.emailError?.email || "");
            setPasswordError(actionData.passwordError?.password || "");
        }
    }, [actionData]);

    const handleVisibility = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        setIsVisible(!isVisible);
    };

    return (
        <div className={`flex flex-col justify-center items-center h-[100vh] w-full  overflow-y-hidden bg-white`}>
            {/* Logo */}
            <div className="h-[100vh] lg:w-[50vw] flex flex-col items-center justify-center">
                <div className="text-center mb-8">

                    <h1 className="text-2xl font-semibold mb-2 font-montserrat">WELCOME BACK</h1>
                    <p className="text-gray-500 italic font-nunito">A legal material portal</p>
                </div>

                <Form method="post" className=" flex flex-col gap-6">
                    <div>
                        <Input
                            name="email"
                            label="Email"
                            labelPlacement="outside"
                            placeholder="Enter your email "
                            type="email"
                            endContent={<Mail className="text-xl text-default-400 " />}
                            className="placeholder:text-gray-300"
                        />
                        {emailError && (
                            <p className="text-danger font-nunito text-md mt-2">
                                {actionData?.emailErrorMessage}
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
                            className="placeholder:text-gray-300"
                            endContent={
                                <button
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
                                {actionData?.passwordErrorMessage}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-between mt-4 gap-4">
                        <Checkbox type="checkbox" name="rememberMe">
                            <p className="font-nunito text-sm ">Remember me</p>
                        </Checkbox>
                        <input type="text" name="intent" hidden value="create" />
                        <Link to="">
                            <p className="text-danger font-nunito text-sm">Forgot password?</p>
                        </Link>
                    </div>
                    <button
                        className="font-nunito bg-primary-500 hover:bg-primary-600  text-lg hover:transition hover:duration-500 hover:-translate-y-2 text-white w-full h-10 mt-10 rounded-xl"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Loggin in..." : "Login"}
                    </button>
                </Form>
            </div>
        </div>
    );
};

export default Login;

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const rememberMe = formData.get("rememberMe") === "on";

    const signin = await login.Logins({ request, email, password, rememberMe });

    return signin;
};
