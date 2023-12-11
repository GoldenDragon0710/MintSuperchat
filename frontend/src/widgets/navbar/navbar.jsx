import React, { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Avatar,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Tooltip,
} from "@material-tailwind/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/actions/auth";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(false);
  const auth = useSelector((state) => state.auth);

  const menuItems = [
    {
      title: "Resource 1",
    },
    {
      title: "Resource 2",
    },
    {
      title: "Resource 3",
    },
  ];

  // useEffect(() => {
  //   if (!auth.token) {
  //     const href = window.location.href;
  //     if (href.includes("/admin")) {
  //       navigate("/admin/login");
  //     } else {
  //       navigate("/login");
  //     }
  //   }
  // }, []);

  const handleLogout = () => {
    dispatch(logout());
    if (auth.user.userType == process.env.isAdmin) {
      navigate("/admin/login");
      return;
    }
    if (auth.user.userType == process.env.isClient) {
      navigate("/login");
      return;
    }
  };

  return (
    <>
      <div className="container relative mx-auto flex items-center justify-between">
        <a href="/">
          <Avatar
            src={`${process.env.REACT_APP_BASED_URL}/images/logo.svg`}
            className="h-auto w-[180px]"
          />
        </a>
        <div className="flex items-center justify-between">
          <a href="/">
            <Typography className="mx-6 text-[16px] font-bold uppercase text-[#174483] hover:cursor-pointer">
              My Connections
            </Typography>
          </a>
          <Menu open={openMenu} handler={setOpenMenu} allowHover>
            <MenuHandler>
              <div className="flex items-center hover:cursor-pointer">
                <Typography className="px-1 text-[16px] font-bold uppercase text-[#174483] ">
                  RESOURCES
                </Typography>
                <ChevronDownIcon
                  strokeWidth={2.5}
                  className={`h-3.5 w-3.5 text-[#174483] transition-transform ${
                    openMenu ? "rotate-180" : ""
                  }`}
                />
              </div>
            </MenuHandler>
            <MenuList className="hidden overflow-visible lg:grid">
              <ul className="flex w-full flex-col gap-1">
                {menuItems.map(({ title }) => (
                  <a href="#" key={title}>
                    <MenuItem>
                      <Typography
                        variant="h6"
                        color="blue-gray"
                        className="mb-1"
                      >
                        {title}
                      </Typography>
                    </MenuItem>
                  </a>
                ))}
              </ul>
            </MenuList>
          </Menu>
          <Typography className="mx-6 text-[16px] font-bold uppercase text-[#174483] hover:cursor-pointer">
            About MintSuperChat
          </Typography>
        </div>
        {auth.user ? (
          <Tooltip content="Log out" placement="bottom">
            <Button
              variant="text"
              onClick={handleLogout}
              className="my-5 flex h-[40px] items-center justify-between rounded-full border-none px-5 py-0 font-normal normal-case shadow-none hover:shadow-none"
            >
              <Typography className="mx-1 text-base font-semibold text-[#174483]">
                {auth.user.username}
              </Typography>
              <Avatar
                src={`${process.env.REACT_APP_BASED_URL}/images/logout.svg`}
                className="h-[20px] w-auto"
              />
            </Button>
          </Tooltip>
        ) : (
          <a href="/login">
            <Button
              variant="outlined"
              className="my-5 flex h-[40px] w-[100px] items-center justify-between rounded-full border-none bg-[#144DD21A] px-5 py-0 font-normal normal-case shadow-none hover:shadow-none"
            >
              <Avatar
                src={`${process.env.REACT_APP_BASED_URL}/images/user.svg`}
                className="h-[15px] w-[14px]"
              />
              <Typography className="text-sm font-semibold text-[#174483]">
                Log in
              </Typography>
            </Button>
          </a>
        )}
      </div>
    </>
  );
}

export default Navbar;
