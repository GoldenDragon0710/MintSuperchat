import {
  Admin,
  AdminLogin,
  AdminRegister,
  AdminUsers,
  AdminPhones,
  AdminChatbots,
  AdminConnect,
  AdminBlocklist,
  AdminDatasets,
  Login,
  Home,
  Connect,
  Chatbots,
  Datasets,
  Blocklist,
} from "@/pages";

export const routes = [
  {
    path: "/admin",
    element: <Admin />,
  },
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin/register",
    element: <AdminRegister />,
  },
  {
    path: "/admin/users",
    element: <AdminUsers />,
  },
  {
    path: "/admin/phones",
    element: <AdminPhones />,
  },
  {
    path: "/admin/chatbots",
    element: <AdminChatbots />,
  },
  {
    path: "/admin/connect",
    element: <AdminConnect />,
  },
  {
    path: "/admin/blocklist",
    element: <AdminBlocklist />,
  },
  {
    path: "/admin/datasets",
    element: <AdminDatasets />,
  },

  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/connect",
    element: <Connect />,
  },
  {
    path: "/chatbots",
    element: <Chatbots />,
  },
  {
    path: "/datasets",
    element: <Datasets />,
  },
  {
    path: "/blocklist",
    element: <Blocklist />,
  },
];

export default routes;
