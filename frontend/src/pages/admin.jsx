import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Button, Breadcrumbs } from "@material-tailwind/react";
import { HomeIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { getUserCount } from "@/actions/user";
import { getChatbotCount } from "@/actions/chatbot";
import { getPhoneCount } from "@/actions/phone";
import { useNavigate } from "react-router-dom";

export function Admin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const botCount = useSelector((state) => state.chatbot.botCount);
  const userCount = useSelector((state) => state.user.userCount);
  const phoneCount = useSelector((state) => state.phone.phoneCount);

  useEffect(() => {
    if (localStorage.getItem("userType") != "admin") {
      navigate("/admin/login");
      return;
    }
    dispatch(getChatbotCount());
    dispatch(getUserCount());
    dispatch(getPhoneCount());
  }, []);

  return (
    <>
      <div className="relative flex h-full min-h-screen content-center justify-center">
        <div className="container relative mx-auto h-full pt-36">
          <Breadcrumbs className="my-2 bg-[#b0b7bb00]">
            <a href="/admin" className="opacity-80">
              <HomeIcon className="h-5 w-5 text-[#174483]" />
            </a>
          </Breadcrumbs>
          <Typography className="ml-4 text-5xl font-bold">
            Superadmin
          </Typography>
          <div className="h-content relative mt-10 rounded-2xl bg-[#FFFFFFBF] p-16 backdrop-blur-sm">
            <div className="flex w-full border-b-2 pb-4">
              <Typography className="mx-2 text-2xl font-bold">
                {userCount} users,
              </Typography>
              <Typography className="mx-2 text-2xl font-bold">
                {phoneCount} connections,
              </Typography>
              <Typography className="text-2xl font-bold">
                {botCount} bots
              </Typography>
            </div>
            <div className="flex">
              <a href="/admin/users/">
                <Button
                  variant="outlined"
                  className="my-5 flex h-[40px] w-auto items-center justify-between rounded-full border-none bg-[#144DD21A] px-5 py-0 font-normal normal-case shadow-none hover:shadow-none"
                >
                  <Typography className="text-sm font-semibold text-[#174483]">
                    Manage users & bots
                  </Typography>
                  <ChevronRightIcon className="h-auto w-[16px] text-[#174483]" />
                </Button>
              </a>
              <a href="/admin/register">
                <Button
                  variant="outlined"
                  className="mx-2 my-5 flex h-[40px] w-auto items-center justify-between rounded-full border-none bg-[#144DD21A] px-5 py-0 font-normal normal-case shadow-none hover:shadow-none"
                >
                  <Typography className="text-sm font-semibold text-[#174483]">
                    Create user
                  </Typography>
                  <ChevronRightIcon className="h-auto w-[16px] text-[#174483]" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Admin;
