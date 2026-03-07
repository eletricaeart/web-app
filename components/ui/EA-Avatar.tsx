import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type EAAvatarProps = {
  name: string;
  url?: string;
  w?: string;
  h?: string;
};

export default function EAAvatar({ name, url, w, h }: EAAvatarProps) {
  const csn = `w-${w || "10"} h-${h || "10"}`;
  {
    /* <Avatar className="h-10 w-10"> */
  }
  return (
    <Avatar className={csn}>
      <AvatarImage src={url} alt={name} />
      <AvatarFallback>
        {name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
