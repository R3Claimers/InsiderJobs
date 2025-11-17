import React, { useContext, useEffect, useState } from 'react'
import {assets} from '../assets/assets'
import { AppContext } from '../context/AppContext';
import api from '../utils/api'
import { useNavigate} from 'react-router-dom'
import { toast } from 'react-toastify';
const RecruiterLogin = () => {

    const navigate = useNavigate();
    const [state,setState] = useState('Login')
    const [name,setName] = useState('')
    const [password,setPassword] = useState('')
    const [email,setEmail] = useState('')

    const [image,setImage] = useState(false)
    const [isTextDataSubmited,setIsTextDataSubmited] = useState(false)

    const { setShowRecruiterLogin , backendUrl , setCompanyToken , setCompanyData } = useContext(AppContext);

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        if(state === "Sign Up" && !isTextDataSubmited){
            return setIsTextDataSubmited(true)
        }

        try {
            if(state === "Login"){
                const { data } = await api.post(backendUrl + '/api/company/login', { email , password })
                
                if (data.success){
                    setCompanyData(data.company)
                    setCompanyToken(data.token)
                    localStorage.setItem('companyToken',data.token)
                    setShowRecruiterLogin(false)
                    navigate('/dashboard')
                }
                else{
                   // show the error message  
                   toast.error(data.message)
                }
            }else{
                const formData = new FormData()
                formData.append('name',name)
                formData.append('password',password)
                formData.append('email',email)
                formData.append('image',image)

                const { data } = await api.post(backendUrl + '/api/company/register',formData)

                if(data.success){
                    setCompanyData(data.company)
                    setCompanyToken(data.token)
                    localStorage.setItem('companyToken',data.token)
                    setShowRecruiterLogin(false)
                    navigate('/dashboard')
                }else{
                    toast.error(data.message)
                }
            }
        } catch (error) {
            const status = error.response?.status;
            if (status === 401) {
                toast.error('Invalid email or password.');
            } else if (status === 409) {
                toast.error('Company already registered. Please login.');
            } else if (status === 400) {
                toast.error('Please fill all required fields.');
            } else if (status === 500) {
                toast.error('Server error. Please try again later.');
            } else {
                toast.error(error.message);
            }
        }

    }   

    useEffect(()=>{
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    },[])

  return (
    <div className='absolute top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center'>
        <form onSubmit={onSubmitHandler} className='relative bg-white p-10 rounded-xl text-slate-500'>
            <h1 className='text-center text-2xl text-neutral-700 font-medium'>Recruiter {state}</h1>
            <p className='text-sm'>{state === 'Login' ? 'Welcome back! Please sign in to continue' : 'Welcome! Please sign up to continue'}</p>
            { state === "Sign Up" && isTextDataSubmited 
            ?
            <>
                <div className='flex items-center gap-4 my-5'>
                    <label htmlFor="image">
                        <img className='w-16 rounded-full' src={ image? URL.createObjectURL(image) : assets.upload_area} alt="" />
                        <input onChange={e=> setImage(e.target.files[0])} type="file" id='image' hidden/>
                    </label>
                    <p>Upload Company <br/> logo</p>
                </div>
            </>
            :
                <>
                {state !== 'Login' && (
                <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5 border-gray-200'>
                    <img src={assets.person_icon} alt="" />
                    <input className='outline-none text-sm' onChange={e => setName(e.target.value)} type="text" value={name} placeholder='Company Name' required />

                </div>
                )}
                
                <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5 border-gray-200'>
                    <img src={assets.email_icon} alt="" />
                    <input className='outline-none text-sm' onChange={e => setEmail(e.target.value)} type="email" value={email} placeholder='Email Id' required />

                </div>
                <div className='border px-4 py-2 flex items-center gap-2 rounded-full mt-5 border-gray-200'> 
                    <img src={assets.lock_icon} alt="" />
                    <input className='outline-none text-sm' onChange={e => setPassword(e.target.value)} type="password" value={password} placeholder='Password' required />

                </div>
                
            </>
            }
            {state === 'Login' && (
                <p className='text-sm text-blue-600 mt-4 cursor-pointer'>Forgot password?</p>
            )}
            

            <button type='submit' className='mt-4 bg-blue-600 w-full text-white py-2 rounded-full'>
                {state === 'Login' ? 'login' : isTextDataSubmited ? 'create account' : 'next'}
            </button>
            {
                state === 'Login'
                ? <p className='mt-5 text-center'>Dont't have an account? <span className='text-blue-600 cursor-pointer' onClick={e=> setState("Sign Up")}>Sign Up</span></p>
                : !isTextDataSubmited && <p className='mt-5 text-center'>Already have an account? <span className='text-blue-600 cursor-pointer' onClick={e=> setState("Login")}>Login</span></p>
            }

            <img onClick={e => setShowRecruiterLogin(false)} className='absolute top-5 right-5 cursor-pointer' src={assets.cross_icon} alt="" />
           
            
        </form>
    </div>
  )
}

export default RecruiterLogin
