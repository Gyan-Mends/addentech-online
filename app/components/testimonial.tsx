import { Card } from "@nextui-org/react"

interface TestimonialCardProps {
    quote: string
    author: string
    role: string
    img: string
}

export function TestimonialCard({ quote, author, role, img }: TestimonialCardProps) {
    return (
        <Card className="border-blue-900/40 bg-gradient-to-br from-gray-900 to-black overflow-hidden">
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
                        <img
                            src={img}
                            alt={author}
                            width={100}
                            height={100}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="flex-1">
                        <div className="flex mb-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <p>!</p>
                                // <Star key={i} className="h-4 w-4 fill-blue-500 text-blue-500" />
                            ))}
                        </div>
                        <p className="text-lg italic mb-4">"{quote}"</p>
                        <div>
                            <p className="font-medium">{author}</p>
                            <p className="text-sm text-gray-400">{role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}
