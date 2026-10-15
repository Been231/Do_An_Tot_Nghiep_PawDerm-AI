import React from 'react';
import { Sun, Moon } from 'lucide-react';
import '../../styles/features.css';

/**
 * Nút chuyển đổi Dark Mode / Light Mode cho toàn hệ thống PawDerm AI
 */
export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      id="btn-theme-toggle"
      className="theme-toggle-btn"
      onClick={onToggle}
      aria-label={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
      title={isDark ? 'Chuyển sang Giao diện Sáng (Light)' : 'Chuyển sang Giao diện Tối (Dark)'}
    >
      <div className={`theme-toggle-thumb ${isDark ? 'dark' : 'light'}`}>
        {isDark ? <Moon size={15} className="theme-icon moon" /> : <Sun size={15} className="theme-icon sun" />}
      </div>
      <span className="theme-toggle-label">{isDark ? 'Tối' : 'Sáng'}</span>
    </button>
  );
}
