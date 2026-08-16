'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import Link from "next/link";
import { useSession, signOut } from 'next-auth/react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import React from 'react'
import Image from 'next/image'
import { User, LogOut } from 'lucide-react'

const NavbarProfile = () => {
    const { data: session } = useSession()
    const user = session?.user

    return (
        <div className="flex items-center gap-2">
            {session ? (
                <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none">
                        <Avatar className="w-8 h-8 cursor-pointer ring-1 ring-border hover:ring-primary transition-all">
                            {user?.image ? (
                                <div className='relative aspect-square h-full w-full'>
                                    <Image src={user.image} fill referrerPolicy='no-referrer' alt={user.name || 'User'} unoptimized />
                                </div>
                            ) : (
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    <User className='h-4 w-4' />
                                </AvatarFallback>
                            )}
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl">
                        <div className="flex flex-col space-y-1 p-2">
                            {user?.name && <p className="font-semibold text-sm">{user.name}</p>}
                            {user?.email && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            className="cursor-pointer text-red-600 focus:text-red-600 gap-2 rounded-lg"
                            onClick={() => signOut({ callbackUrl: "/sign-in" })}
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <Link 
                    href="/sign-in" 
                    className="text-sm font-medium hover:underline text-primary"
                >
                    Login
                </Link>
            )}
        </div>
    )
}

export default NavbarProfile