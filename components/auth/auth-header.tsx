import LogoMark from "@/components/logo-mark";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <LogoMark className="h-9 w-9" />
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold text-card-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthHeader;
