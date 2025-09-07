
'use client';

export default function SearchBar({ value, onChange, loading }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search books..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
      />
      {loading && <div className="search-loading">Searching...</div>}
    </div>
  );
}