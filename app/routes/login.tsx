"use client"

import { useState } from "react"
import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
    Button,
    Input,
    Checkbox,
    Divider,
} from "@nextui-org/react"
import { Eye, EyeOff, Lock, Mail, MapPin, Phone, ArrowRight, User } from 'lucide-react'
import { Link } from "@remix-run/react"

export default function SignupPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [agreeTerms, setAgreeTerms] = useState(false)

    const toggleVisibility = () => setIsVisible(!isVisible)

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault()
        // Handle signup logic here
        console.log({ firstName, lastName, email, password, agreeTerms })
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            <main className="flex-1 flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="inline-block mb-4">
                            <div className="h-16 w-16 rounded bg-blue-500 flex items-center justify-center text-white text-3xl font-bold mx-auto">
                                D
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold mb-2">DENNISLAW</h1>
                        <p className="text-blue-400 italic">A legal material portal</p>
                    </div>

                    <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-blue-900/40 p-8 shadow-xl shadow-blue-900/5">
                        <h2 className="text-2xl font-bold mb-6">Create Your Account</h2>
                        <form onSubmit={handleSignup} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Input
                                        type="text"
                                        label="First Name"
                                        placeholder="Enter your first name"
                                        value={firstName}
                                        onValueChange={setFirstName}
                                        startContent={<User className="text-gray-400" size={18} />}
                                        classNames={{
                                            base: "max-w-full",
                                            inputWrapper: "bg-gray-800/50 border-blue-900/40 hover:border-blue-500/50 group-data-[focus=true]:border-blue-500",
                                            label: "text-gray-400 group-data-[focus=true]:text-blue-500",
                                        }}
                                        isRequired
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="text"
                                        label="Last Name"
                                        placeholder="Enter your last name"
                                        value={lastName}
                                        onValueChange={setLastName}
                                        startContent={<User className="text-gray-400" size={18} />}
                                        classNames={{
                                            base: "max-w-full",
                                            inputWrapper: "bg-gray-800/50 border-blue-900/40 hover:border-blue-500/50 group-data-[focus=true]:border-blue-500",
                                            label: "text-gray-400 group-data-[focus=true]:text-blue-500",
                                        }}
                                        isRequired
                                    />
                                </div>
                            </div>
                            <div>
                                <Input
                                    type="email"
                                    label="Email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onValueChange={setEmail}
                                    startContent={<Mail className="text-gray-400" size={18} />}
                                    classNames={{
                                        base: "max-w-full",
                                        inputWrapper: "bg-gray-800/50 border-blue-900/40 hover:border-blue-500/50 group-data-[focus=true]:border-blue-500",
                                        label: "text-gray-400 group-data-[focus=true]:text-blue-500",
                                    }}
                                    isRequired
                                />
                            </div>
                            <div>
                                <Input
                                    type={isVisible ? "text" : "password"}
                                    label="Password"
                                    placeholder="Create a password"
                                    value={password}
                                    onValueChange={setPassword}
                                    startContent={<Lock className="text-gray-400" size={18} />}
                                    endContent={
                                        <button type="button" onClick={toggleVisibility} className="focus:outline-none">
                                            {isVisible ? (
                                                <EyeOff className="text-gray-400 hover:text-gray-300" size={18} />
                                            ) : (
                                                <Eye className="text-gray-400 hover:text-gray-300" size={18} />
                                            )}
                                        </button>
                                    }
                                    classNames={{
                                        base: "max-w-full",
                                        inputWrapper: "bg-gray-800/50 border-blue-900/40 hover:border-blue-500/50 group-data-[focus=true]:border-blue-500",
                                        label: "text-gray-400 group-data-[focus=true]:text-blue-500",
                                    }}
                                    isRequired
                                />
                            </div>
                            <div>
                                <Checkbox
                                    isSelected={agreeTerms}
                                    onValueChange={setAgreeTerms}
                                    color="primary"
                                    classNames={{
                                        label: "text-gray-400 text-sm",
                                    }}
                                >
                                    I agree to the{" "}
                                    <Link to="/terms" className="text-blue-500 hover:text-blue-400">
                                        Terms of Service
                                    </Link>{" "}
                                    and{" "}
                                    <Link to="/privacy" className="text-blue-500 hover:text-blue-400">
                                        Privacy Policy
                                    </Link>
                                </Checkbox>
                            </div>
                            <Button
                                type="submit"
                                className="bg-blue-500 hover:bg-blue-600 text-white w-full"
                                size="lg"
                                isDisabled={!agreeTerms}
                            >
                                Create Account
                            </Button>
                        </form>

                        <Divider className="my-6 bg-blue-900/40" />

                        <div className="text-center">
                            <p className="text-gray-400 mb-4">Already have an account?</p>
                            <Link to="/login">
                                <Button
                                    className="bg-transparent border-1 border-blue-500 text-blue-500 hover:bg-blue-500/10 w-full"
                                    size="lg"
                                >
                                    Login
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 text-sm">
                            Need help?{" "}
                            <Link to="/contact" className="text-blue-500 hover:text-blue-400">
                                Contact our support team
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
