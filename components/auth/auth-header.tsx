interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

/** The app's auth voice: the title in bold lowercase, its last word in green. */
const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => {
  const words = title.toLowerCase().split(" ");
  const last = words.pop();

  return (
    <div className="flex flex-col gap-3">
      <h2 style={{ lineHeight: 0.95 }} className="text-[clamp(34px,4vw,44px)] font-extrabold tracking-[-0.045em] text-foreground">
        {words.length ? `${words.join(" ")} ` : null}
        <span className="text-primary">{last}</span>
      </h2>
      <p className="text-base text-muted-foreground">{subtitle}</p>
    </div>
  );
};

export default AuthHeader;
