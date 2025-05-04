import { Button, Card, CardHeader } from "@nextui-org/react"
import type { ReactNode } from "react"
import { CardTitle } from "./acternity/card"
import { Link } from "@remix-run/react"

interface ServiceCardProps {
    title: string
    description: string
    icon?: ReactNode
    features?: string[]
    benefits?: string[]
    href?: string
}

export function ServiceCard({ title, description, icon, features = [], benefits = [], href }: ServiceCardProps) {
    return (
        <Card className="border-blue-900/40 bg-gradient-to-br from-gray-900 to-black overflow-hidden group hover:border-blue-500/50 transition-all duration-300 h-full flex flex-col">
            <CardHeader className="pb-2">
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
                <CardTitle className="text-xl group-hover:text-blue-500 transition-colors">{title}</CardTitle>
            </CardHeader>
            <div className="flex-1 flex flex-col">
                <p className="text-muted-foreground mb-4">{description}</p>

                {features.length > 0 && (
                    <div className="mt-auto">
                        <div className="h-px w-full bg-blue-900/20 mb-4"></div>
                        <h4 className="text-sm font-medium mb-2">Key Features:</h4>
                        <ul className="space-y-2">
                            {features.slice(0, 3).map((feature, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                    {/* <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" /> */}
                                    <span className="text-muted-foreground">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        {benefits.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium mb-2">Benefits:</h4>
                                <ul className="space-y-2">
                                    {benefits.slice(0, 2).map((benefit, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            {/* <CheckCircle className="h-4 w-4 text-cyan-500 mt-0.5 flex-shrink-0" /> */}
                                            <span className="text-muted-foreground">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {href ? (
                            <Link to={href}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-4 w-full group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors"
                                >
                                    View Service Details
                                    {/* <ChevronRight className="ml-2 h-4 w-4" /> */}
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-4 w-full group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-colors"
                            >
                                Learn More
                                {/* <ArrowRight className="ml-2 h-4 w-4" /> */}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </Card>
    )
}
