'use client';
import React from 'react';

interface SettingToggleProps {
  title: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  onToggle: () => void;
}

export const SettingToggle = ({ title, description, icon, isEnabled, onToggle }: SettingToggleProps) => {
  return (
    <div className="settings-item">
      <div className="settings-content">
        <span className="settings-icon">{icon}</span>
        <div className="settings-text">
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
      </div>
      <label className="toggle-switch">
        <input type="checkbox" checked={isEnabled} onChange={onToggle} />
        <span className="slider round"></span>
      </label>
    </div>
  );
};