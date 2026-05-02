'use client';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = ({ label, iconLeft, iconRight, ...props }: InputProps) => (
  <div className="input-group">
    <label>{label}</label>
    <div className="input-wrapper">
      {iconLeft && <span className="icon-left">{iconLeft}</span>}
      <input {...props} />
      {iconRight && <span className="icon-right">{iconRight}</span>}
    </div>
  </div>
);