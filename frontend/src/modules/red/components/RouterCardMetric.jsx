import React from "react";
import "../router-card-light-skin.css";

export default function RouterCardMetric({ icon: Icon, label, value, progress = null, tone = "cyan" }) {
  const safeProgress = progress == null ? null : Math.max(0, Math.min(100, Number(progress) || 0));
  return (
    <div className={`router-modern-metric router-modern-metric--${tone}`}>
      <div className="router-modern-metric__head">
        <span className="router-modern-metric__icon"><Icon aria-hidden="true" /></span>
        <span className="router-modern-metric__label">{label}</span>
      </div>
      <strong className="router-modern-metric__value">{value}</strong>
      {safeProgress != null && (
        <div className="router-modern-progress" aria-hidden="true">
          <span style={{ width: `${safeProgress}%` }} />
        </div>
      )}
    </div>
  );
}
