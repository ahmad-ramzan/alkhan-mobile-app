import { createContext, useContext, useState, type ReactNode } from 'react';

type MenuContextValue = {
  menuItems: any[];
  itemRatings: Record<string, any>;
  setMenuData: (menuItems: any[], itemRatings: Record<string, any>) => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);

/**
 * Holds the last-loaded menu items + item ratings so screens like Search can
 * read them without re-fetching or prop-drilling through the router.
 */
export function MenuProvider({ children }: { children: ReactNode }) {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [itemRatings, setItemRatings] = useState<Record<string, any>>({});

  const setMenuData = (items: any[], ratings: Record<string, any>) => {
    setMenuItems(items);
    setItemRatings(ratings);
  };

  return (
    <MenuContext.Provider value={{ menuItems, itemRatings, setMenuData }}>{children}</MenuContext.Provider>
  );
}

export function useMenuData() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error('useMenuData must be used within a MenuProvider');
  return ctx;
}
