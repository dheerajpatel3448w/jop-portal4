/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";


import { AppContextType, AppProviderProps, User } from "@/type";
import Cookies from "js-cookie";
import { createContext, useContext, useEffect } from "react";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import axios from "axios";
import toast from "react-hot-toast";
import { Application } from "@/type";

const AppContext = createContext<AppContextType|undefined>(undefined)

export const AppProvider:React.FC<AppProviderProps>=({children})=>{
    const [user, setUser] = useState<User|null>(null)
    const [isAuth, setIsAuth] = useState(false)
    const [loading, setLoading] = useState(true);
    const [btnLoading, setBtnLoading] = useState(false)
    const token = Cookies.get("token");
    const fetchUser = async () => {
        try {
            const {data} = await axios.get(`${user_service}/user/profile`,{
                withCredentials:true,
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })
            setUser(data.user);
            setIsAuth(true);
            setLoading(false);
            
        } catch (error) {
            console.log(error)

            setIsAuth(false);
            setLoading(false);
            
        }
        finally{
            setLoading(false);
        }
    }

 const updateProfilePic = async (formData:FormData) => {
    try {
        const {data}=await axios.put(`${user_service}/user/updateprofilepic`,formData,{
            headers:{
                Authorization: `Bearer ${token}`
            },
            withCredentials:true
        })
        toast.success(data.message)
        fetchUser();


        toast.success(data.message)
    } catch (error:any) {
        toast.error(error.response.data.message)
    }
    finally{
        setLoading(false);
    }
 }

 const updateResume = async (formData:FormData) => {
    try {
        const {data}=await axios.put(`${user_service}/user/updateresume`,formData,{
            headers:{
                Authorization: `Bearer ${token}`
            },
            withCredentials:true
        })
        toast.success(data.message)
        fetchUser();


        toast.success(data.message)
    } catch (error:any) {
        toast.error(error.response.data.message)
    }
    finally{
        setLoading(false);
    }
 }
         const updateUser = async (name:string,phoneNumber:string,bio:string) => {
            try {
                setBtnLoading(true);
                const {data}=await axios.put(`${user_service}/user/updateuser`,{name,phoneNumber,bio},{
                    headers:{
                        Authorization: `Bearer ${token}`
                    },
                    withCredentials:true
                })
                toast.success(data.message)
                fetchUser();
                setBtnLoading(false);
    
    
                toast.success(data.message)
            } catch (error:any) {
                 
                toast.error(error.response.data.message)
            }
            finally{
                setBtnLoading(false);
            }
         }
    const logoutuser = async () => {
       
        try {
            const {data}= await axios.get(`${user_service}/user/logout`,{
                withCredentials:true,
                headers:{
                    Authorization: `Bearer ${token}`
                }
            })
            console.log(data);
            toast.success(data.message);

        } catch (error) {
            console.log(error);            
        }

        Cookies.set("token","");
        setUser(null);
        setIsAuth(false);
    }
const addSkill = async (skill:string,setSkill:React.Dispatch<React.SetStateAction<string>>) => {
try {
    setBtnLoading(true);
    const {data} = await axios.post(`${user_service}/user/addskill`,{skillname:skill},{
        headers:{
            Authorization: `Bearer ${token}`
        },
        withCredentials:true
    });
    toast.success(data.message);
    fetchUser();
    setSkill("");
} catch (error:any) {
    console.log(error);
toast.error(error.response.data.message)   
    
}finally{
    setBtnLoading(false);
}
}
const removeSkill = async (skill:string) => {
try {
    setBtnLoading(true);
    const {data} = await axios.put(`${user_service}/user/deleteskill`,{skillname:skill},{
        headers:{
            Authorization: `Bearer ${token}`
        },
        withCredentials:true
    });
    toast.success(data.message);
    fetchUser();
    
} catch (error:any) {
    console.log(error);
toast.error(error.response.data.message)   
    
}finally{
    setBtnLoading(false);
}
}



  
async function applyJob(job_id: number) {
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${user_service}/user/applyjob`,
        { jobId:job_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials:true
        }
      );

      toast.success(data.message);
      fetchApplications();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setBtnLoading(false);
    }
  }

  const [applications, setApplications] = useState<Application[]>([]);

  async function fetchApplications() {
    try {
      const { data } = await axios.get(
        `${user_service}/user/getallapplication`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials:true
        }
      );

      setApplications(data.application);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchUser();
    fetchApplications();
  }, []);

    return <>
    <AppContext.Provider value={{user,setUser,isAuth,setIsAuth,loading,setLoading,btnLoading,setBtnLoading, fetchApplications,logoutuser,updateProfilePic,updateResume,updateUser,addSkill,removeSkill,applyJob,
        applications,}}>
        {children}
        <Toaster/>
    </AppContext.Provider>
    </>
}
export const useAppData = ():AppContextType => {
  const context = useContext(AppContext);
if (!context) {
    throw new Error("useAppData must be used within an AppProvider");
  }
    return context;
}

export const utils_service = process.env.NEXT_PUBLIC_API_UTILS;
export const auth_service = process.env.NEXT_PUBLIC_API_AUTH;
export const job_service = process.env.NEXT_PUBLIC_API_JOB;
export const user_service = process.env.NEXT_PUBLIC_API_USER;
export const payment_service = process.env.NEXT_PUBLIC_API_PAYMENT;
