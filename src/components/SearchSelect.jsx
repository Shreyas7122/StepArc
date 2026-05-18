import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search } from 'lucide-react';

const SearchSelect = ({ items, selectedId, onSelect, placeholder }) => {
  const [query, setQuery] = useState(
    () => items.find(i => i.id === selectedId)?.label || ''
  );
  const [open, setOpen]   = useState(false);
  const [pos, setPos]     = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);
  const dropdownRef  = useRef(null);

  const filtered = query.trim()
    ? items.filter(i => i.label.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : items.slice(0, 6);

  const updatePos = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
  };

  const handleOpen   = () => { updatePos(); setOpen(true); };
  const handleSelect = (item) => { setQuery(item.label); onSelect(item.id); setOpen(false); };

  useEffect(() => {
    const close = (e) => {
      if (!containerRef.current?.contains(e.target) && !dropdownRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [open]);

  return (
    <div ref={containerRef}>
      <div style={{ position: 'relative' }}>
        <Search
          size={15}
          style={{
            position: 'absolute',
            left: 13,
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--gold-500)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder={placeholder || 'Search…'}
          value={query}
          onChange={(e) => { setQuery(e.target.value); handleOpen(); }}
          onFocus={handleOpen}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          style={{ paddingLeft: 38 }}
        />
      </div>

      {open && filtered.length > 0 && createPortal(
        <div
          ref={dropdownRef}
          className="search-dropdown"
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width }}
        >
          {filtered.map(item => (
            <div
              key={item.id}
              className="search-option"
              onClick={() => handleSelect(item)}
            >
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  color: 'var(--white)',
                }}
              >
                {item.label}
              </div>
              {item.sub && (
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.72rem',
                    color: 'var(--gray-500)',
                    marginTop: 2,
                  }}
                >
                  {item.sub}
                </div>
              )}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default SearchSelect;
