import React from "react";
import { User } from "@nextui-org/react";

interface CustomUserInterface {
  name?: string;
  email?: string;
  avatarSrc?: string;
}

const CustomUser = ({
  name,
  email,
  avatarSrc,
}: CustomUserInterface) => {
  return (
    <User
      name={
        <p className="font-nunito text-xs">
          {name}
        </p>
      }
      description={
        <p>
          {email}
        </p>
      }
      avatarProps={{
        src: avatarSrc || "https://i.pravatar.cc/150?u=a04258114e29026702d",
      }}
    />
  );
};

export default CustomUser;
