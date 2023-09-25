import { Home } from "@/pages";
import { HomeIcon } from "@heroicons/react/24/solid";

export const routes = [
  {
    icon: HomeIcon,
    name: "home",
    path: "/home",
    element: <Home />,
  },
];

export default routes;
