import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Button, Breadcrumbs } from "@material-tailwind/react";
import { HomeIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { getUsers } from "@/actions/user";
import { getChatbots } from "@/actions/chatbot";
import { getPhones } from "@/actions/phone";
import { useNavigate } from "react-router-dom";

export function AdminUsers() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bots = useSelector((state) => state.chatbot.bots);
  const users = useSelector((state) => state.user.users);
  const phones = useSelector((state) => state.phone.phones);
  const [userinfo, setUserInfo] = useState(null);

  useEffect(() => {
    dispatch(getUsers());
    dispatch(getChatbots({}));
    dispatch(getPhones({}));
  }, []);

  useEffect(() => {
    let list = [];
    if (users) {
      users.map((userItem) => {
        let dataObj = {
          id: userItem._id,
          username: userItem.username,
          email: userItem.email,
          botCount: 0,
          phoneCount: 0,
        };
        if (phones) {
          phones.map((phoneItem) => {
            if (phoneItem.userId == userItem._id) {
              dataObj.phoneCount++;
              if (bots) {
                bots.map((botItem) => {
                  if (botItem.phoneId == phoneItem._id) {
                    dataObj.botCount++;
                  }
                });
              }
            }
          });
        }
        list.push(dataObj);
      });
    }
    setUserInfo(list);
  }, [bots, users, phones]);

  const handleUser = (id, username) => {
    localStorage.setItem("curUserId", id);
    localStorage.setItem("curUsername", username);
    navigate("/admin/phones");
  };

  return (
    <>
      <div className="flex h-full min-h-screen justify-center">
        <div className="container mx-auto h-full pt-36">
          <Breadcrumbs className="my-2 bg-[#b0b7bb00]">
            <a href="/admin">
              <HomeIcon className="h-5 w-5 text-[#174483]" />
            </a>
            <a href="/admin/users">
              <Typography className="font-normal text-[#174483]">
                Users
              </Typography>
            </a>
          </Breadcrumbs>
          <Typography className="ml-4 text-5xl font-bold">Users</Typography>
          <div className="h-content relative mt-10 rounded-2xl bg-[#FFFFFFBF] py-2 pl-10 pr-3 backdrop-blur-sm">
            <div className="max-h-90 flex h-full flex-col overflow-y-auto px-4">
              {userinfo &&
                userinfo.map((item, idx) => {
                  return (
                    <div key={idx}>
                      <div className="flex w-full items-center justify-between py-2 pr-5">
                        <div className="flex items-center">
                          <div className="pr-5">
                            <Typography className="text-lg font-semibold">
                              {item.username}
                            </Typography>
                            <Typography className="text-sm">
                              {item.email}
                            </Typography>
                          </div>
                          <Typography className="text-base">
                            {item.phoneCount}{" "}
                            {item.phoneCount < 2 ? "Connection" : "Connections"}
                          </Typography>
                          <Typography className="px-5">●</Typography>
                          <Typography>
                            {item.botCount} {item.botCount < 2 ? "bot" : "bots"}
                          </Typography>
                        </div>
                        <Button
                          variant="text"
                          onClick={() => handleUser(item.id, item.username)}
                          className="flex h-10 w-10 items-center justify-center p-0"
                        >
                          <ChevronRightIcon className="h-4 w-4 stroke-[#174483] stroke-2" />
                        </Button>
                      </div>
                      {idx != userinfo.length - 1 && (
                        <div className="w-full border-b-2" />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminUsers;
