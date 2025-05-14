import { Button, Card } from "@nextui-org/react"
import { Link } from "@remix-run/react"
import { ArrowRight, Sparkles } from "lucide-react"

export default function AdvertBanner() {
    return (
        <section className="py-10 lg:py-16 px-4 lg:px-[125px]">
            <Card className="relative overflow-hidden border border-black/10 hover:border-pink-500/50 backdrop-blur">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-full blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-pink-500/20 to-purple-600/20 rounded-full blur-3xl -z-10 transform -translate-x-1/3 translate-y-1/3"></div>

                <div className="grid md:grid-cols-2 gap-8 p-6 md:p-10 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-400/10 border border-pink-400/20">
                            <Sparkles className="h-4 w-4 text-pink-400" />
                            <span className="text-sm font-medium text-pink-400">Awards & Recognition</span>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-bold font-montserrat">
                            Proud Nominee for the{" "}
                            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                                2025 African Legal Innovation
                            </span>{" "}
                            & Technology Awards
                        </h2>

                        <p className="text-muted-foreground font-nunito">
                            Honored to be recognized for revolutionizing legal services with technology. Join us in redefining the future of legal innovation.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link to="/learn-more">
                                <Button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                                    Support our Mission
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>

                        </div>
                    </div>


                    <div className="relative h-[300px] rounded-lg overflow-hidden hover:transform hover:perspective-[1000px] hover:rotate-x-6 hover:rotate-y-6 hover:scale-105 transition-transform duration-500">
                        <img
                            src="https://res.cloudinary.com/djlnjjzvt/image/upload/v1747070545/hero1_rfu05r.jpg"
                            alt="Legal tech promotion"
                            className="h-full w-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                            <div className="bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-lg p-4 w-full">
                                <p className="font-bold text-lg font-montserrat">African Legal Awadrds</p>

                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </section>
    )
}
