import React from 'react'

function Footer() {
  return (
    <div className='h-16 bg-blue-900 w-full flex flex-col justify-center items-center p-4'>
      <div className='flex flex-row justify-between items-center'>
        <div className='flex flex-col justify-center items-center'>
          <h1 className='text-xl'>Tunist ~ @2025</h1>
          <p className='text-md'>Last Updated on 10-06-2025</p>
        </div>
      </div>
    </div>
  )
}

export default Footer