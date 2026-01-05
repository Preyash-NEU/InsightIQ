// QualityBadge Component
// Displays data quality score with visual indicator

import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import DataSourceService from '../services/dataSourceService';

interface QualityBadgeProps {
  score: number | null | undefined;
  level?: string | null;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const QualityBadge: React.FC<QualityBadgeProps> = ({
  score,
  level,
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  // Get colors based on score
  const colors = DataSourceService.getQualityColor(score);

  // Size classes
  const sizeClasses = {
    sm: {
      badge: 'px-2 py-1 text-xs',
      icon: 'w-3 h-3',
      bar: 'h-1',
    },
    md: {
      badge: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4',
      bar: 'h-2',
    },
    lg: {
      badge: 'px-4 py-2 text-base',
      icon: 'w-5 h-5',
      bar: 'h-3',
    },
  };

  const sizes = sizeClasses[size];

  // Get icon based on level
  const getIcon = () => {
    if (!score && score !== 0) return <HelpCircle className={sizes.icon} />;
    
    if (score >= 80) return <CheckCircle2 className={sizes.icon} />;
    if (score >= 60) return <AlertTriangle className={sizes.icon} />;
    return <XCircle className={sizes.icon} />;
  };

  // If no score, show "Not Processed"
  if (!score && score !== 0) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${sizes.badge} ${colors.bg} ${colors.text} border ${colors.border} rounded-full font-medium ${className}`}>
        <HelpCircle className={sizes.icon} />
        {showLabel && <span>Not Processed</span>}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`inline-flex items-center gap-1.5 ${sizes.badge} ${colors.bg} ${colors.text} border ${colors.border} rounded-full font-medium`}>
        {getIcon()}
        {showLabel && (
          <>
            <span>{score.toFixed(0)}%</span>
            <span className="opacity-75">({colors.label})</span>
          </>
        )}
        {!showLabel && <span>{score.toFixed(0)}%</span>}
      </span>
    </div>
  );
};

// Quality Progress Bar
export const QualityProgressBar: React.FC<{
  score: number | null | undefined;
  showPercentage?: boolean;
  className?: string;
}> = ({ score, showPercentage = true, className = '' }) => {
  const colors = DataSourceService.getQualityColor(score);

  if (!score && score !== 0) {
    return (
      <div className={className}>
        <div className="w-full h-2 rounded-full bg-slate-700/50">
          <div className="h-2 rounded-full bg-slate-600/50" style={{ width: '0%' }} />
        </div>
        {showPercentage && (
          <p className="mt-1 text-xs text-slate-500">Not processed</p>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="w-full h-2 rounded-full bg-slate-700/50">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            score >= 80 ? 'bg-emerald-500' : 
            score >= 60 ? 'bg-yellow-500' : 
            'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      {showPercentage && (
        <p className={`mt-1 text-xs ${colors.text}`}>
          {score.toFixed(1)}% quality
        </p>
      )}
    </div>
  );
};

export default QualityBadge;
