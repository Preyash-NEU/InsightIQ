// QualityBadge - GLASSMORPHIC STYLE (Matches Navy Sage Theme)
// Premium glass effect with gradient text and subtle glow

import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, XCircle } from 'lucide-react';

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
  showLabel = false,
  size = 'md',
  className = '',
}) => {
  // Size configurations
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  // Get gradient and glow based on score
  const getStyles = () => {
    if (!score && score !== 0) {
      return {
        textGradient: 'from-slate-300 to-slate-400',
        glow: 'shadow-slate-500/10',
        dotColor: 'bg-slate-400',
        icon: <AlertTriangle className="w-4 h-4" />,
        label: 'Unknown'
      };
    }

    if (score >= 90) {
      return {
        textGradient: 'from-emerald-300 to-cyan-400',
        glow: 'shadow-emerald-500/30',
        dotColor: 'bg-emerald-400',
        icon: <Sparkles className="w-4 h-4" />,
        label: 'Excellent'
      };
    } else if (score >= 80) {
      return {
        textGradient: 'from-green-300 to-emerald-400',
        glow: 'shadow-green-500/20',
        dotColor: 'bg-green-400',
        icon: <TrendingUp className="w-4 h-4" />,
        label: 'Good'
      };
    } else if (score >= 70) {
      return {
        textGradient: 'from-yellow-300 to-orange-400',
        glow: 'shadow-yellow-500/15',
        dotColor: 'bg-yellow-400',
        icon: <AlertTriangle className="w-4 h-4" />,
        label: 'Fair'
      };
    } else if (score >= 60) {
      return {
        textGradient: 'from-orange-300 to-red-400',
        glow: 'shadow-orange-500/15',
        dotColor: 'bg-orange-400',
        icon: <AlertTriangle className="w-4 h-4" />,
        label: 'Poor'
      };
    } else {
      return {
        textGradient: 'from-red-300 to-red-500',
        glow: 'shadow-red-500/20',
        dotColor: 'bg-red-400',
        icon: <XCircle className="w-4 h-4" />,
        label: 'Critical'
      };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`inline-flex items-center ${sizeClasses[size]} rounded-xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/30 shadow-lg ${styles.glow} hover:scale-105 transition-all ${className}`}
    >
      {/* Pulsing status dot */}
      <div className={`w-2 h-2 rounded-full ${styles.dotColor} animate-pulse`} />
      
      {/* Gradient score */}
      <span className={`font-bold bg-gradient-to-r ${styles.textGradient} bg-clip-text text-transparent`}>
        {score?.toFixed(0)}%
      </span>
      
      {/* Optional level label */}
      {showLabel && (
        <span className="text-xs text-slate-400 font-medium">
          {styles.label}
        </span>
      )}
    </div>
  );
};

// Quality Progress Bar - OPTIONAL (can be removed if not needed)
export const QualityProgressBar: React.FC<{
  score: number | null | undefined;
  showPercentage?: boolean;
  className?: string;
}> = ({ score, showPercentage = true, className = '' }) => {
  if (!score && score !== 0) return null;

  const getBarColor = () => {
    if (score >= 90) return 'bg-gradient-to-r from-emerald-500 to-cyan-500';
    if (score >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (score >= 70) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-orange-500 to-red-500';
  };

  return (
    <div className={className}>
      <div className="w-full h-2 rounded-full bg-slate-700/30 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {showPercentage && (
        <p className="mt-1 text-xs text-slate-400">
          {score.toFixed(1)}% quality
        </p>
      )}
    </div>
  );
};

export default QualityBadge;
