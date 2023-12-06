import React, { useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
  Chip,
  Tooltip,
  Button,
  Breadcrumbs,
} from "@material-tailwind/react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { HomeIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getPhones, deletePhone } from "@/actions/phone";

export function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = localStorage.getItem("userId");
  const phones = useSelector((state) => state.phone.phones);

  useEffect(() => {
    if (localStorage.getItem("userType") != "client") {
      navigate("/login");
      return;
    }
    const data = { userId: userId };
    dispatch(getPhones(data));
  }, []);

  const handleDeletePhone = (id) => {
    const data = { id: id };
    dispatch(deletePhone(data));
  };

  const handleChatbots = (id, title) => {
    navigate(`/chatbots`);
    localStorage.setItem("phoneId", id);
    localStorage.setItem("phoneTitle", title);
  };

  return (
    <>
      <div className="flex h-full min-h-screen justify-center">
        <div className="container mx-auto h-full pt-36">
          <Breadcrumbs className="my-2 bg-[#b0b7bb00]">
            <a href="/">
              <HomeIcon className="h-5 w-5 text-[#174483]" />
            </a>
            <a href="/">
              <Typography className="font-normal text-[#174483]">
                Connections
              </Typography>
            </a>
          </Breadcrumbs>
          <Typography className="ml-4 text-5xl font-bold">
            Connections
          </Typography>
          <div className="my-10 rounded-2xl px-20 pb-10 pt-20">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {phones &&
                phones.map((item, idx) => {
                  return (
                    <Card key={idx} className="h-[300px] w-[370px]">
                      <CardBody className="flex h-full flex-col justify-between">
                        <div className="flex w-full flex-col">
                          <div className=" mb-5 flex justify-center border-b-2 pb-5">
                            <Typography className=" text-xl font-bold text-black">
                              {item.title}
                            </Typography>
                          </div>
                          <div className="flex w-full justify-between">
                            <Typography className="mx-2 text-base font-medium text-black">
                              Phone Number:
                            </Typography>
                            <Typography className="text-md font-semibold text-black">
                              +{item.phone}
                            </Typography>
                          </div>
                          <div className="flex w-full justify-between">
                            <Typography className="mx-2 text-base font-medium text-black">
                              Chatbot Count:
                            </Typography>
                            <Typography className="text-md font-semibold text-black">
                              {item.botCount}
                            </Typography>
                          </div>
                          <div className="flex w-full justify-between">
                            <Typography className="mx-2 text-base font-medium text-black">
                              Status:
                            </Typography>
                            <Typography
                              className="text-md font-medium"
                              color={item.delflag ? "gray" : "green"}
                              value={item.delflag ? "Inactive" : "Active"}
                            >
                              {item.delflag ? "Inactive" : "Active"}
                            </Typography>
                          </div>
                        </div>
                        <div className="flex w-full justify-between">
                          <Tooltip placement="bottom" content="Delete">
                            <Button
                              variant="text"
                              onClick={() => handleDeletePhone(item._id)}
                              className="flex w-fit items-center rounded-full px-4 py-2 text-sm font-medium normal-case text-[#FF4343]"
                            >
                              <TrashIcon className="mr-1 w-4 text-[#FF4343]" />
                              Delete
                            </Button>
                          </Tooltip>
                          <Chip
                            size="sm"
                            variant="filled"
                            onClick={() => handleChatbots(item._id, item.title)}
                            value={"Manage bots >"}
                            className="hover: cursor-pointer rounded-full bg-[#144DD21A] text-sm font-medium normal-case text-[#174483]"
                          />
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}

              <a href="/connect">
                <Card className="h-[300px] w-[370px] cursor-pointer border-2 border-dashed border-[#17448380] bg-[#b0b7bb28] backdrop-blur-sm">
                  <CardBody className="flex h-full w-full items-center justify-center">
                    <Typography className=" text-lg font-semibold text-[#174483]">
                      + New Connection
                    </Typography>
                  </CardBody>
                </Card>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
