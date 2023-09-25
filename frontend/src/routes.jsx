import { Home } from "@/pages";
import { HomeIcon } from "@heroicons/react/24/solid";

export const routes = [
  {
    icon: HomeIcon,
    name: "Home",
    path: "/",
    element: <Home />,
  },
];

export default routes;
