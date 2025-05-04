import { Card } from "@nextui-org/react";
import { Linkedin, Twitter, Mail } from "lucide-react"; // Import necessary icons

interface SocialLink {
    platform: string;
    url: string;
}

interface TeamMemberProps {
    name: string;
    role: string;
    img: string;
    socials?: SocialLink[]; // Add optional socials prop
}

export function TeamMember({ name, role, img, socials }: TeamMemberProps) {
    const socialIcons = {
        linkedin: Linkedin,
        twitter: Twitter,
        mail: Mail,
    };

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
                    {socials?.map(({ platform, url }) => {
                        const Icon = socialIcons[platform];
                        return (
                            <a
                                key={platform}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500/20 transition-colors"
                            >
                                {Icon ? <Icon className="h-4 w-4" /> : platform}
                            </a>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}
