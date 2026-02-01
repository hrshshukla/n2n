import React from "react";
import logo from "../assets/images/Picsart_26-01-22_21-26-32-317.png";
import Image from "next/image";
import Link from "next/link";
import { GithubIcon } from "lucide-react";

export default function Navbar() {
  return (
    <div
      className="
        navbar backdrop-blur-sm text-sm fig-bold transform
        flex items-center justify-between py-1
        bg-gray-600/20 h-14
        w-[90%] md:w-1/2
        border border-gray-600/30
        mx-auto md:my-10
        rounded-full
        md:absolute md:translate-x-1/2 md:z-50
      "
    >
      {/* Logo + (desktop) text */}
      <div className="logo flex items-center w-1/3 cursor-pointer h-full gap-2">
        <Image src={logo} alt="logo" className="h-full w-fit p-1" />
        {/* show on desktop only */}
        <p className="hidden md:block text-white">Node 2 Node</p>
      </div>

      {/* Tabs / Links */}
      <div className="tabs flex items-center w-2/3 md:w-1/2 justify-end h-full rounded-full">
        <Link
          href="https://github.com/hrshshukla"
          target="_blank"
          className="
            text-white h-full
            w-1/2 md:w-24
            rounded-full flex items-center justify-center
            hover:bg-white/10
          "
        >
          Profile
        </Link>

        <Link
          href="https://github.com/hrshshukla/n2n"
          target="_blank"
          className="
            text-white h-full
            w-1/2 md:w-32
            rounded-full flex items-center justify-between
            pl-2 md:pl-7 pr-1
            gap-2
            hover:bg-white/10
          "
        >
          <span>Repo</span>
          <GithubIcon
            fill="#000"
            stroke="none"
            size={16}
            className="bg-white rounded-full size-10 p-1 md:p-1"
          />
        </Link>
      </div>
    </div>
  );
}
