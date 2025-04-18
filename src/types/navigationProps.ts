// types/navigationProps.ts
export type NavigatorItems = {
  image: React.ElementType;
  name: string;
};

export type NavigatorItemsProps = NavigatorItems & {
  onClick?: () => void;
};