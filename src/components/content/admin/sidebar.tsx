import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Cube,
  Trophy,
  Group,
  User,
  Settings,
  // DoubleCheck,
} from "iconoir-react";
import { type Model } from ".";

const groups = [
  {
    id: "models",
    group: "Models",
    items: [
      {
        id: "cards",
        label: "Cards",
        href: "/admin/models?model=cards",
        Icon: Cube,
      },
      {
        id: "fights",
        label: "Fights",
        href: "/admin/models?model=fights",
        Icon: Trophy,
      },
      {
        id: "fighters",
        label: "Fighters",
        href: "/admin/models?model=fighters",
        Icon: Group,
      },
      // {
      //   id: "results",
      //   label: "Results",
      //   href: "/admin/models?model=results",
      //   Icon: DoubleCheck,
      // },
    ],
  },
  {
    id: "users",
    group: "Users",
    items: [
      {
        id: "users",
        label: "Users",
        href: "/admin/models?model=users",
        Icon: User,
      },
    ],
  },
  {
    id: "admin",
    group: "Admin",
    items: [
      {
        id: "settings",
        label: "Settings",
        href: "/admin/settings",
        Icon: Settings,
      },
    ],
  },
];

type SidebarProps = {
  className?: string;
  model: Model;
};

const Sidebar = ({ className, model }: SidebarProps) => {
  return (
    <div className={className}>
      <div className="flex flex-col gap-4 py-4">
        {groups.map(({ id, group, items }) => (
          <div key={id} className="px-3 py-2">
            <h3 className="px-4">{group}</h3>
            <div className="flex flex-col gap-1">
              {items.map(({ id, label, href, Icon }) => (
                <Button
                  key={id}
                  variant={model === id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Sidebar };
