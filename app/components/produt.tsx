import { Button } from "@nextui-org/react";
import { CardBody, CardContainer, CardItem } from "./acternity/3d";
import jl from "../components/images/JL.png"
import dl from "~/components/images/Dennislaw-Logo.svg"
import mr from "~/components/images/mr-logo.png"
import news from "~/components/images/DL-News-Logo-LPNLKYG2.png"
import { ChevronRight } from "lucide-react";
import ScrollAnimation from "./animation";
import { Link } from "@remix-run/react";

export function ProductCard({ id, className }: { id?: string, className: string }) {
    return (
        <section id={id} className={className}>
            <div className="container">
                <ScrollAnimation>
                    <div className="flex flex-col items-center justify-center text-center mb-6">
                        <h2 className="text-3xl md:text-3xl font-montserrat font-bold mb-4">
                            Top-Notch Software Development and Digital Transformation
                        </h2>
                        <p className="font-montserrat text-muted-foreground max-w-[800px]">
                        Discover our innovative legal tech solutions that streamline workflows and elevate client experiences.
                        </p>
                    </div>
                </ScrollAnimation>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 md:gap-4 lg:px-20">
                    {[
                         {
                            link: "https://www.dennislawgh.com/",
                            title: "DennisLaw",
                            description: "AI-powered legal assistant",
                            image: dl,
                            type: "brand",
                            className: "h-60 w-80 transition-transform group-hover:scale-105", 
                        },
                         {
                            link: "https://dennislawnews.com/",
                            title: "Dennislaw News",
                            description: "Stay updated on legal trends",
                            image: news,
                            type: "news",
                            className: "h-20 mb-20 mt-20  flex items-center justify-center w-80 transition-transform group-hover:scale-105", 
                        },
                        {
                            link: "",
                            title: "Justice Locator",
                            description: "Legal advice on the go",
                            image: jl,
                            type: "mobile",
                            className: "h-60 w-80 transition-transform group-hover:scale-105", 
                        },
                       
                        {
                            link: "http://marryrightgh.com/",
                            title: "MarryRight",
                            description: "Family law simplified",
                            image: mr,
                            type: "app",
                            className: "h-60 w-80 transition-transform group-hover:scale-105", 
                        },
                       
                    ].map((product, i) => (
                        <ScrollAnimation>
                            <CardContainer
                                key={i}
                                className={`inter-var shadow-md rounded-lg group overflow-hidden -mt-20 lg:mt-0 backdrop-blur transition-all hover:border-border hover:bg-background/80 bg-white border border-black/10 hover:transform-3d `}
                            >
                                <CardBody className="dark:bg-[#09090B80 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] lg:w-20 sm:w-[30rem] h-auto rounded-xl p-6 !border !border-white/20">
                                    <CardItem
                                        translateZ="50"
                                        className="text-xl text-neutral-600 dark:text-white"
                                    >
                                        <p className="text-md font-nunito font-bold">
                                            {product.title}
                                        </p>
                                        <p className="text-sm font-nunito">{product.description}</p>
                                    </CardItem>

                                    <CardItem className="mt-2 flex items-center justify-center mb-10 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className={product.className}
                                        />
                                    </CardItem>

                                    <Link to={product.link}><Button
                                        variant="flat"
                                        size="sm"
                                        className="w-full hover:bg-gradient font-montserrat"
                                    >
                                        Explore Product
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                    </Link>
                                </CardBody>
                            </CardContainer>
                        </ScrollAnimation>
                    ))}
                </div>

            </div>
        </section>
    )
}
