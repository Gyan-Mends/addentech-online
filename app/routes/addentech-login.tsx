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
import { EyeSlashFilledIcon } from "~/components/icons/EyeFilled";
import { EyeFilledIcon } from "~/components/icons/EyeSlash";
import logo from "~/components/images/Dennislaw-Logo.svg"

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
        <div className={`flex flex-col justify-center items-center h-[100vh] bg-[#0b0e13] overflow-y-hidden bg-[#191919]`}>
            <div className="pt-10">
                <img src={logo} className="h-40 w-80" alt="Addentech Logo" />
            </div>
            <div className="h-[100vh] w-full flex items-center justify-center">
                <div className="dark:bg-[#333] bg-[#333] shadow-sm p-6 rounded-2xl lg:w-[30vw] border dark:border-white/5 border-white/5 relative">
                    <p className="font-montserrat font-semibold text-3xl text-white">Login To</p>
                    <p className="font-montserrat font-semibold text-3xl mt-2 text-white">Your Account</p>
                    <Form method="post" className="mt-16">
                        <div>
                            <Input
                                name="email"
                                label="Email"
                                labelPlacement="outside"
                                placeholder=" "
                                isRequired
                                isClearable
                                type="email"
                                classNames={{
                                    label: `${emailError ? "text-danger" : "text-white "} font-nunito text-sm !text-white`,
                                    inputWrapper: `${emailError ? "border-b-danger border-2 hover:border-b-danger text-danger" : " hover:border-primary"} border-white/30 text-sm font-nunito border-b-1 mt-4 bg-[#333] border `
                                }}
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
                                isRequired
                                label="Password"
                                labelPlacement="outside"
                                type={isVisible ? "text" : "password"}
                                className="mt-8"
                                placeholder=" "
                                classNames={{
                                    label: `${passwordError ? "text-danger" : "text-white "} font-nunito text-sm !text-white`,
                                    inputWrapper: `${passwordError ? "border-b-danger border-2 hover:border-b-danger text-danger" : " hover:border-primary"} border-white/30 text-sm font-nunito border-b-1 mt-4 bg-[#333] border `
                                }}
                                endContent={
                                    <button
                                        className="focus:outline-none"
                                        onClick={handleVisibility}
                                    >
                                        {isVisible ? (
                                            <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                        ) : (
                                            <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
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
                            className="font-nunito bg-primary text-lg hover:transition hover:duration-500 hover:-translate-y-2 text-white w-full h-10 mt-10 rounded-xl"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Loggin in..." : "Login"}
                        </button>
                    </Form>
                </div>
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
