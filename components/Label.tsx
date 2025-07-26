import React from 'react'

type LabelProps = {
    title: string
} & React.LabelHTMLAttributes<HTMLLabelElement>

export default function Label({title, ...props}: LabelProps) {
  return (
    <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70' {...props}>{title}</label>
  )
}
