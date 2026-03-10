import View, { ViewProps } from "./View";

interface PageProps extends ViewProps {
  hasBottomNavBar?: boolean;
}

export default function Page({
  tag,
  className,
  children,
  hasBottomNavBar,
  ...props
}: PageProps) {
  const combinedClassName =
    `flex flex-col bg-[linear-gradient(45deg,#00559c50,transparent)] w-full min-h-svh ${className || ""}`.trim();

  return (
    <View tag={tag || "page"} className={combinedClassName} {...props}>
      {children}
      {hasBottomNavBar && (
        <View tag="bottom-spacer" className="flex w-full h-[92px]" />
      )}
    </View>
  );
}
