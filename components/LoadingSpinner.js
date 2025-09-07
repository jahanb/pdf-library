
'use client';

export default function LoadingSpinner({ size = 'medium' }) {
  const sizeClass = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  }[size];

  return (
    <div className={`spinner ${sizeClass}`}>
      <div className="spinner-circle"></div>
    </div>
  );
}
