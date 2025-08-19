import React from 'react'
import { twMerge } from "tailwind-merge"

type LabelProps = {
    title: string
} & React.LabelHTMLAttributes<HTMLLabelElement>

export default function Label({title, className, ...props}: LabelProps) {
  return (
    <label className={twMerge(`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70`, className)} {...props}>{title}</label>
  )
}
