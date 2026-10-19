type PageHeadingProps = {
  index: string;
  eyebrow: string;
  heading: [string, string];
  deck: string;
};

export function PageHeading({ index, eyebrow, heading, deck }: PageHeadingProps) {
  return (
    <section className="page-heading">
      <div className="page-heading-index">{index}</div>
      <p className="eyebrow">
        <i aria-hidden="true" />
        {eyebrow}
      </p>
      <h1>
        {heading[0]}
        <br />
        {heading[1]}
      </h1>
      <p className="page-deck">{deck}</p>
    </section>
  );
}
