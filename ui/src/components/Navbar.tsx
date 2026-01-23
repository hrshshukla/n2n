import React from 'react';
import logo from '../assets/images/Picsart_26-01-22_21-26-32-317.png'
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
      <div className="navbar backdrop-blur-sm fig-bold absolute transform translate-x-1/2 z-50 flex items-center justify-around py-1 bg-gray-600/20 h-14 w-1/2 border border-gray-600/30 mx-auto my-10 rounded-full ">
        
        <div className="logo flex items-center w-1/3 h-full gap-2">
            <Image src={logo} alt="logo" className='h-full w-fit p-1' />
            <p className='text-white' >Node 2 Node</p>
        </div>
        
        <div className="tabs flex items-center w-1/2 justify-end h-full rounded-full gap">
           <Link href={''}  className='text-white h-full w-24 rounded-full flex items-center justify-center hover:bg-white/10'> Home</Link>
           <Link href={''}  className='text-white text- h-full w-24 rounded-full flex items-center justify-center hover:bg-white/10'> Docs</Link>
        </div>


      </div>
  );
}
