"use client";

import React, { useState } from 'react'
import Link from 'next/link';
import { Button } from './ui/button';
import { Briefcase, Home, Info, LogOut, Menu, User, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ModeToggle } from './mode-toggle';
import {  useAppData } from '@/context/AppContext';

const Navbar = () => {
    const [isopen,setisopen]=useState(false);
    const {isAuth,user,setUser,setIsAuth,loading,logoutuser}=useAppData() 

    const toggleMenu=()=>{
        setisopen(!isopen);
    }
   
    const logoutHandler = () => {
        logoutuser();
        setUser(null);
        setIsAuth(false);
    }
  return (
    <>
    <nav className='z-50 sticky top-0 bg-background/80 border-4 backdrop-blur-md shadow-sm'>
    <div className='max-w-7xl mx-auto px-4 sm:px-4 lg:px-8'>
        <div className='flex justify-between  items-center h-16'>
            <div className='flex items-center'>
                <Link href={'/'} className='flex items-center gap-1 group'>
                <div className='text-2xl font-bold tracking-tight'>
                   <span className='bg-linear-to-r from bg-blue-600 to-blue-800 bg-clip-text text-transparent'>Hire</span>
                   <span className='text-red-500'>Heaven</span>
                </div>
                </Link>

            </div>
            {/* desktop menu */}
            <div className='hidden md:flex items-center space-x-1 '>

            <Link href={'/'}>
            <Button variant={'ghost'} className='flex items-center gap-2 font-medium'><Home size={16} />Home</Button>
            </Link>

            <Link href={'/jobs'}>
            <Button variant={'ghost'} className='flex items-center gap-2 font-medium'><Briefcase size={16} />Jobs</Button>
            </Link>

             <Link href={'/about'}>
            <Button variant={'ghost'} className='flex items-center gap-2 font-medium'><Info size={16} />About</Button>
            </Link>

            </div>
            {/* right side actions*/}
            <div className='hidden md:flex items-center space-x-2'>
                {
                   loading?"":
                   <>
                   {
                    isAuth ? <>
                    <Popover>
                        <PopoverTrigger asChild>
                <button className='flex item-center gap-2 hover:opacity-80 transition-opacity'>
                    <Avatar className='h-9 w-9 ring-2 ring-offset-2 ring-offset-background  ring-blue-500/20 cursor-pointer hover:ring-blue-500/40 transition-all'>
                       <AvatarImage src={user ? user.profile_pic as string :"" } alt={user?.name} />
                      <AvatarFallback className=' bg-blue-100 dark:bg-blue-900 text-blue-600'>{user?.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                </button>
                        </PopoverTrigger>
                        <PopoverContent className='w-56 p-2' align='end'>
                            <div className='px-3 py-2 mb-2 border-b'>
                                <p className='text-sm font-semibold '> {user?.name}</p>
                                <p className=' text-xs opacity-60 truncate'>
                                    {user?.email}
                                </p>

                            </div>
                            <Link href={'/account'}>
                            <Button variant={'ghost'} className='w-full justify-start gap-2'>
                            <User size={16}/>Profile
                            </Button>
                            </Link>
                            <Button variant={'ghost'} className='w-full justify-start gap-2' onClick={logoutHandler}><LogOut size={16}></LogOut></Button>
                        </PopoverContent>
                    </Popover>
                    </>
                    :
                    <Link href={'/login'}><Button className='gap-2'><User size={16}/>sign In</Button></Link>
                
                   }
                   </>

                   }
                <ModeToggle/>
            </div>
            {/* mobile menu button */}
            <div className='md:hidden flex items-center gap-3'>
                <ModeToggle/>
                <button onClick={toggleMenu} className='p-2 rounded-md hover:bg-accent transition-colors ' aria-label='Toggle Menu'>
                    {
                        isopen?<>
                        <X size={20}/>
                        </>
                        :
                        <Menu size={20}/>
                    }
            </button>

           </div>
        </div>

    </div>
{/* mobile view */}
<div className={`md:hidden border-t overflow-hidden transition-all duration-300 ease-in-out ${isopen ? 'max-h-96 opacity-100':'max-h-0 opacity-0'}`}>
    <div className=' px-3 py-2 space-y-1 bg-background/95 backdrop-blur-md'>
    {/*is auth or user */}
    <Link href={'/'} onClick={toggleMenu}>
    <Button variant={'ghost'} className='w-full justify-start gap-3 h-11'>
    <Home size={16} />
    Home
        </Button>
    </Link>
    <Link href={'/jobs'} onClick={toggleMenu}>
    <Button variant={'ghost'} className='w-full justify-start gap-3 h-11'>
    <Briefcase size={16} />
    Jobs
        </Button>
    </Link>
    <Link href={'/about'} onClick={toggleMenu}>
    <Button variant={'ghost'} className='w-full justify-start gap-3 h-11'>
    <Info size={16} />
    About
        </Button>
    </Link>
    {
    isAuth ? <>
     <Link href={'/account'} onClick={toggleMenu}>
    <Button variant={'ghost'} className='w-full justify-start gap-3 h-11'>
    <User size={16} />
    My Profile
        </Button>
    </Link>
      <Button
    variant={'destructive'}
    className='w-full justify-start gap-3 h-11'
    onClick={()=>{
        logoutHandler();
        toggleMenu();
    }}
    >
    <LogOut size={16} />
    </Button>
    
    </>:
    <>
    <Link href={"/login"} onClick={toggleMenu}>
    <Button  className='w-full justify-start gap-3 h-11 mt-2'>
    <User size={16} />
    Sign In
        </Button>
    </Link>
  
    </>
    }
  </div>

</div>
    </nav>
    </>
  )
}

export default Navbar
