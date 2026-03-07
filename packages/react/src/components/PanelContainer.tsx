import type { PanelContainerProps } from '../types'

export function PanelContainer({
  children,
  emptyDescription,
  emptyTitle,
  isOpen,
  panelId,
  title,
}: PanelContainerProps) {
  return (
    <section
      aria-live="polite"
      className="cs-shell__panel-host"
      data-panel-state={isOpen ? 'open' : 'closed'}
    >
      {isOpen ? (
        <div
          aria-labelledby={`${panelId}-title`}
          className="cs-shell__panel-card"
          id={panelId}
          role="region"
          tabIndex={-1}
        >
          <header className="cs-shell__panel-header">
            <h2 className="cs-shell__panel-title" id={`${panelId}-title`}>
              {title}
            </h2>
          </header>
          <div className="cs-shell__panel-body">{children}</div>
        </div>
      ) : (
        <div className="cs-shell__panel-empty" role="status">
          <h2 className="cs-shell__panel-empty-title">{emptyTitle}</h2>
          <p className="cs-shell__panel-empty-description">{emptyDescription}</p>
        </div>
      )}
    </section>
  )
}
