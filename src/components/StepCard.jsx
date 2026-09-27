/**
 * A numbered step in a "how it works" sequence.
 *
 * `lineClamp` guards the body: step copy varies in length and a four-line
 * card next to a two-line card leaves a ragged grid.
 */
export function StepCard({ number, icon: Icon, title, body }) {
  return (
    <article className="card-lift min-w-0 rounded-xl border border-border bg-card p-5">
      <span className="text-xs font-semibold tracking-widest text-primary">
        {number}
      </span>
      {Icon ? (
        <span
          aria-hidden="true"
          className="mt-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
        >
          <Icon size={20} strokeWidth={1.75} />
        </span>
      ) : null}
      <h3 className="mt-3 text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{body}</p>
    </article>
  );
}

export default StepCard;
