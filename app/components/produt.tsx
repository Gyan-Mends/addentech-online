import { Button } from "@nextui-org/react";
import { CardBody, CardContainer, CardItem } from "./acternity/3d";
import jl from "../components/images/JL.png"
import dl from "~/components/images/Dennislaw-Logo.svg"
import mr from "~/components/images/mr-logo.png"
import news from "~/components/images/DL-News-Logo.png"
import { ChevronRight } from "lucide-react";

export function ProductCard({ id }: { id?: string }) {
    return (
        <section id={id} className="py-20 bg-black lg:px-[35px]">
            <div className="container">
                <div className="flex flex-col items-center justify-center text-center mb-6">
                    <p className="mb-4 font-bold font-montserrat  bg-clip-text text-primary-500 text-xl">Explore More of Our Products</p>
                    <h2 className="text-3xl md:text-3xl font-montserrat font-bold mb-4">
                        Top-Notch Software Development and Digital Transformation
                    </h2>
                    <p className="font-montserrat text-muted-foreground max-w-[800px]">
                        Explore our suite of innovative legal tech solutions designed to streamline workflows and enhance client
                        experiences.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 px-20">
                    {[
                        {
                            title: "Justice Locator",
                            description: "Legal advice on the go",
                            image: jl,
                            type: "mobile",
                        },
                        {
                            title: "DennisLaw",
                            description: "AI-powered legal assistant",
                            image: dl,
                            type: "brand",
                        },
                        {
                            title: "MarryRight",
                            description: "Family law simplified",
                            image: mr,
                            type: "app",
                        },
                        {
                            title: "Legal News",
                            description: "Stay updated on legal trends",
                            image: news,
                            type: "news",
                        },
                    ].map((product, i) => (
                        < CardContainer
                            key={i}
                            className=" inter-var group overflow-hidden  backdrop-blur transition-all hover:border-border hover:bg-background/80 !bg-[#09090B80]"
                        >
                            <CardBody className="!bg-[#09090B80 relative group/card  dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2]  w-20 sm:w-[30rem] h-auto rounded-xl p-6 !border !border-primary-500/40   ">
                                <CardItem translateZ="50"
                                    className="text-xl  text-neutral-600 dark:text-white">
                                    <p className="text-md group-hover:text-primary font-nunito font-bold">{product.title}</p>
                                    <p className="text-sm font-nunito">{product.description}</p>
                                </CardItem>

                                <CardItem className="mt-2 mb-10  overflow-hidden rounded-lg bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="lg:h-60 lg:w-80  transition-transform group-hover:scale-105"
                                    />
                                </CardItem>

                                <Button
                                    variant="flat"
                                    size="sm"
                                    className="w-full group-hover:bg-gradient-to-br from-blue-500 to-cyan-600  font-montserrat"
                                >
                                    Explore Product
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardBody>

                        </CardContainer>

                    ))}
                </div>
            </div>
        </section>
    )
}
