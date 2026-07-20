// components/widgets/WidgetCard.tsx
//
// The shell every widget renders inside: a titled card with a loop-stage
// eyebrow and an honest empty state. Generic + cartridge-blind — the title and
// meaning come from configuration (the resolved widget's `title`), never from a
// vertical noun baked into the component.

import type { ResolvedWidget } from "@/core/widgets";

export default function WidgetCard({
  widget,
  toolbar,
  footer,
  children,
}: {
  widget: ResolvedWidget;
  toolbar?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card widget">
      <div className="widget__head">
        <div>
          <div className="eyebrow">{widget.loopStage}</div>
          <div className="widget__title">{widget.title}</div>
        </div>
        {toolbar}
      </div>
      {widget.state === "empty" ? (
        <p className="muted widget__empty">{widget.emptyMessage ?? "Nothing here yet."}</p>
      ) : (
        children
      )}
      {footer}
    </section>
  );
}
