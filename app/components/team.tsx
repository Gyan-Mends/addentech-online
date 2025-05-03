import { Card } from "@nextui-org/react"

interface TeamMemberProps {
    name: string
    role: string
    img: string
}

export function TeamMember({ name, role, img }: TeamMemberProps) {
    return (
        <Card className="border border-blue-900/40 bg-gradient-to-br from-gray-900 to-black overflow-hidden group">
            <div className="aspect-[3/4] overflow-hidden">
                <img
                    src={img || "/placeholder.svg"}
                    alt={name}
                    width={300}
                    height={400}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>
            <div className="p-4 font-nunito">
                <h3 className="font-bold text-lg font-montserrat">{name}</h3>
                <p className="text-gray-400 text-sm mb-3">{role}</p>
                <div className="flex gap-3">
                    <button className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500/20 transition-colors">
                        {/* <Linkedin className="h-4 w-4" /> */}
                    </button>
                    <button className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500/20 transition-colors">
                        {/* <Twitter className="h-4 w-4" /> */}
                    </button>
                    <button className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500/20 transition-colors">
                        {/* <Mail className="h-4 w-4" /> */}
                    </button>
                </div>
            </div>
        </Card>
    )
}
