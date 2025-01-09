

import { User } from '@/db/dummy'
import {create} from 'zustand'

interface SelectUserState{
    selectedUser: User | null
    setSelectedUser: (user:User | null) => void
}



export const useSelectedUser = create<SelectUserState>((set)=>({
    selectedUser:null,
    setSelectedUser:(user:User | null)=> set({selectedUser:user})
}))