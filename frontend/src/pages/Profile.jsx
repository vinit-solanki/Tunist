import axios from 'axios'
import React, { useEffect, useState } from 'react'

function Profile() {
  const [profile, setProfile] = useState({
      "_id": "",
      "name": "",
      "email": "",
      "role": "",
      "playlist": [],
  })
  useEffect(()=>{
    fetchProfile()
  },[])
  const [error, setError] = useState("")
  const fetchProfile = async ()=>{
    try{
      const response = await axios.get('https://tunist-user-service.onrender.com/api/v1/user/me');
      if(!response){
        setError("Failed to set profile")
        return;
      }
      setProfile(response.data)
    }
    catch(e){
      console.log(e)
    }
  }
  return (
    <div className='min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4'>
        {error ==="" ? (<div>
          Failed to fetch Profile. Work in Progress...
        </div>) : (<div className='bg-white/20 rounded-xl shadow-md p-6'>
          <h2 className='text-2xl font-semibold mb-4'>Profile</h2>
          <div className='mb-4'>
            <label className='block text-gray-200 text-sm font-bold mb-2'>Name: {profile.name}</label>
          </div>
          <div className='mb-4'>
            <label className='block text-gray-200 text-sm font-bold mb-2'>{profile.email}</label>
          </div>
          <div className='mb-4'>
            <label className='block text-gray-200 text-sm font-bold mb-2'>{profile.role}</label>
          </div>
        </div>)}
    </div>
  )
}

export default Profile