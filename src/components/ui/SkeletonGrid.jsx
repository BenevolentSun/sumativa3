import React from 'react';

export default function SkeletonGrid({ count = 12 }) {
  return (
    <div className="row g-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2">
          <div className="surface" style={{ padding: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
            <div className="skeleton" style={{ height: 140 }} />
            <div style={{ padding: '10px 12px 12px' }}>
              <div className="skeleton" style={{ height: 12, borderRadius: 4, marginBottom: 6 }} />
              <div className="skeleton" style={{ height: 10, width: '60%', borderRadius: 4 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
