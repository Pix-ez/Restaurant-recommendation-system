// @ts-nocheck
import { useEffect, useState } from 'react'

export const  Featured= ({ title, link, img, online }) =>{

    return(<>

    <div className='flex flex-col bg-slate-600 rounded-2xl'>
        <h1 className=' text-center text-3xl font-semibold'>{title}</h1>
        <a href={link} target="_blank">Maps Link</a>
        <img src={img} alt={title} className='p-2 rounded-lg'/>
        <a href={online} target="_blank">Order Online</a>
    </div>
    </>)
}