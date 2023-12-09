import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import {
  Button,
  Card,
  CardBody,
  Typography,
  Input,
  Chip,
  Tooltip,
  Breadcrumbs,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Avatar,
} from "@material-tailwind/react";
import {
  HomeIcon,
  BookOpenIcon,
  TrashIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import {
  PlusIcon,
  ArrowPathIcon,
  PauseIcon,
  PlayIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import {
  addChatbot,
  deleteChatbot,
  getChatbots,
  updateChatbot,
} from "@/actions/chatbot";

export function AdminChatbots() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const curUserId = localStorage.getItem("curUserId");
  const curUsername = localStorage.getItem("curUsername");
  const phoneId = localStorage.getItem("phoneId");
  const phoneTitle = localStorage.getItem("phoneTitle");
  const auth = useSelector((state) => state.auth.user);
  const chatbots = useSelector((state) => state.chatbot.bots);
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [addable, setAddable] = useState(false);
  const [required, setRequired] = useState(false);
  const TABLE_HEAD = ["No", "Details", "Actions"];

  useEffect(() => {
    if (auth.username == null) {
      navigate("/admin/users");
      return;
    }
    if (phoneId == null) {
      navigate("/admin/phones");
      return;
    }
    handlechatbots();
  }, []);

  const handlechatbots = () => {
    setLoading(true);
    const data = { phoneId: phoneId };
    dispatch(getChatbots(data))
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  };

  const handleAddable = () => {
    setAddable(true);
  };

  const handleOpen = () => {
    setAddable((cur) => !cur);
    setNewTitle("");
    setRequired(false);
  };

  const handleNewTitle = (e) => {
    if (e.target.value == "") {
      setRequired(true);
    } else {
      setRequired(false);
    }
    setNewTitle(e.target.value);
  };

  const handleAddChatbot = () => {
    if (newTitle == "") {
      setRequired(true);
      return;
    }
    setLoading(true);
    const data = { userId: curUserId, phoneId: phoneId, title: newTitle };
    dispatch(addChatbot(data))
      .then(() => {
        setLoading(false);
        setAddable(false);
        setNewTitle("");
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const handleDelete = (id) => {
    setLoading(true);
    const data = {
      id: id,
      phoneId: phoneId,
    };
    dispatch(deleteChatbot(data))
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  };

  const handleSetActive = (id, status) => {
    setLoading(true);
    const data = {
      id: id,
      phoneId: phoneId,
      active: status === true ? false : true,
    };
    dispatch(updateChatbot(data))
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  };

  const handleDatasets = (id, title) => {
    navigate(`/admin/datasets`);
    localStorage.setItem("botId", id);
    localStorage.setItem("botTitle", title);
  };

  const handleBlocklist = () => {
    navigate(`/admin/blocklist`);
  };

  return (
    <>
      <div className="flex h-full min-h-screen justify-center pb-16">
        <div className="container relative mx-auto h-full pt-36 ">
          <Breadcrumbs className="my-2 bg-[#b0b7bb00]">
            <a href="/admin">
              <HomeIcon className="h-5 w-5 text-[#174483]" />
            </a>
            <a href="/admin/users">
              <Typography className="font-normal text-[#174483]">
                Users
              </Typography>
            </a>
            <a href="/admin/phones">
              <Typography className="font-normal text-[#174483]">
                {curUsername}
              </Typography>
            </a>
            <a href="/admin/chatbots">
              <Typography className="font-normal text-[#174483]">
                {phoneTitle}
              </Typography>
            </a>
          </Breadcrumbs>
          <div className="flex w-full justify-between">
            <Typography className="ml-4 text-5xl font-bold">
              Manage bots
            </Typography>
            <div className="flex ">
              <Button
                variant="text"
                onClick={handlechatbots}
                className="mx-2 flex h-[50px] w-[200px] items-center justify-center rounded-full border-[#174483]  normal-case text-[#174483] shadow-none hover:shadow-none"
              >
                {loading ? (
                  <ClipLoader
                    color={"#174483"}
                    loading={loading}
                    size={13}
                    cssOverride={{ height: "25px", width: "25px" }}
                  />
                ) : (
                  <ArrowPathIcon className="h-5 w-5 text-[#174483]" />
                )}
                <Typography className="mx-2 text-[16px] font-semibold">
                  Refresh
                </Typography>
              </Button>
              <Button
                variant="outlined"
                onClick={handleAddable}
                className="mx-auto flex h-[50px] w-[200px] items-center justify-center rounded-full border-[#174483]  normal-case text-[#174483] shadow-none hover:shadow-none"
              >
                <PlusIcon className="w-5" />
                <Typography className="mx-2 text-[16px] font-semibold">
                  Add Chatbot
                </Typography>
              </Button>
            </div>
          </div>
          <div className="h-content relative my-10 rounded-2xl px-10 py-10 backdrop-blur-sm">
            <Card className="h-full w-full">
              <CardBody className="p-0">
                <table className="w-full min-w-max table-auto text-left">
                  <thead>
                    <tr className="border-t-0">
                      {TABLE_HEAD.map((head) => (
                        <th
                          key={head}
                          className="border-b border-blue-gray-100 px-6 py-4"
                        >
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="text-base font-semibold leading-none text-black"
                          >
                            {head}
                          </Typography>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chatbots &&
                      chatbots.map((item, index) => {
                        const isLast = index === chatbots.length - 1;
                        const classes = isLast
                          ? "p-4"
                          : "p-4 border-b border-blue-gray-50";

                        return (
                          <tr key={index}>
                            <td className={classes}>
                              <div className="flex gap-3">
                                <div className="mx-2 flex cursor-pointer items-center">
                                  <Typography
                                    variant="small"
                                    color="black"
                                    className=" text-lg font-normal"
                                  >
                                    {index + 1}
                                  </Typography>
                                </div>
                              </div>
                            </td>
                            <td className={classes}>
                              <div className="flex gap-3">
                                <div
                                  onClick={() =>
                                    handleDatasets(item._id, item.title)
                                  }
                                  className="flex cursor-pointer items-center"
                                >
                                  <Avatar
                                    src={`${process.env.REACT_APP_BASED_URL}/imgs/bot.svg`}
                                    className="mx-2 h-5 w-6 rounded-none"
                                  />
                                  <Typography
                                    variant="small"
                                    color="black"
                                    className=" text-lg font-normal"
                                  >
                                    {item.title}
                                  </Typography>
                                </div>
                                <Chip
                                  size="sm"
                                  variant="filled"
                                  value={
                                    item.active === true ? "Running" : "Paused"
                                  }
                                  className={
                                    item.active
                                      ? "bg-[#00BD851A] text-[#00BD85]"
                                      : "bg-[#0000001A] text-black"
                                  }
                                />
                              </div>
                            </td>
                            <td className={classes}>
                              <div className=" flex w-max cursor-pointer items-center">
                                {item.active ? (
                                  <div
                                    className="flex items-center"
                                    onClick={() =>
                                      handleSetActive(item._id, item.active)
                                    }
                                  >
                                    <PauseIcon className="mx-1 h-4 w-4 text-black" />
                                    <Typography
                                      color="black"
                                      className="text-sm font-medium"
                                    >
                                      Pause
                                    </Typography>
                                  </div>
                                ) : (
                                  <div
                                    className="flex items-center"
                                    onClick={() =>
                                      handleSetActive(item._id, item.active)
                                    }
                                  >
                                    <PlayIcon className="mx-1 h-4 w-4 text-black" />
                                    <Typography
                                      color="black"
                                      className="text-sm font-medium"
                                    >
                                      Run
                                    </Typography>
                                  </div>
                                )}
                                <Tooltip content="Block List">
                                  <div
                                    className="mx-5 flex items-center"
                                    onClick={handleBlocklist}
                                  >
                                    <ListBulletIcon
                                      color="black"
                                      className="mx-1 h-4 w-4 stroke-2"
                                    />
                                    <Typography
                                      color="black"
                                      className=" text-sm font-medium"
                                    >
                                      Block list
                                    </Typography>
                                  </div>
                                </Tooltip>
                                <Tooltip content="Train">
                                  <div
                                    className="mx-5 flex items-center"
                                    onClick={() =>
                                      handleDatasets(item._id, item.title)
                                    }
                                  >
                                    <BookOpenIcon
                                      color="black"
                                      className="mx-1 h-4 w-4"
                                    />
                                    <Typography
                                      color="black"
                                      className=" text-sm font-medium"
                                    >
                                      Train
                                    </Typography>
                                  </div>
                                </Tooltip>
                                <Tooltip content="Delete">
                                  <div
                                    className="mx-5 flex items-center"
                                    onClick={() => handleDelete(item._id)}
                                  >
                                    <TrashIcon className="mx-1 h-4 w-4 text-[#ff0000]" />
                                    <Typography className=" text-sm font-medium text-[#ff0000]">
                                      Delete
                                    </Typography>
                                  </div>
                                </Tooltip>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </CardBody>
            </Card>
            <Dialog size="xs" open={addable} handler={handleOpen}>
              <DialogHeader className="justify-between border-[1px] border-[#0000001A]">
                <Typography variant="h5" color="black">
                  New Chatbot
                </Typography>
                <Button
                  variant="text"
                  className="flex h-8 w-8 items-center justify-center rounded-full p-0"
                  onClick={handleOpen}
                >
                  <XMarkIcon color="black" className="h-5 w-5" />
                </Button>
              </DialogHeader>
              <DialogBody>
                <div className="w-full">
                  <Typography className="font-bold text-black">
                    Bot Name
                  </Typography>
                  <div className="rounded-lg border-[1px] border-[#0000009b]">
                    <Input
                      label=""
                      onChange={handleNewTitle}
                      value={newTitle}
                      maxLength={30}
                      placeholder="My Awesome Chatbot"
                      className="min-h-full !border-0 !text-base !font-normal focus:border-transparent"
                      containerProps={{
                        className: "grid h-full",
                      }}
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                    />
                  </div>
                  {required && (
                    <Typography color="red" className="text-sm font-normal">
                      *This field is required
                    </Typography>
                  )}
                </div>
              </DialogBody>
              <DialogFooter>
                <Button
                  variant="filled"
                  onClick={handleAddChatbot}
                  className="mx-2 flex h-[50px] items-center justify-center rounded-full bg-[#174483] normal-case shadow-none hover:shadow-none"
                >
                  {loading ? (
                    <ClipLoader
                      color={"#fff"}
                      loading={loading}
                      size={13}
                      cssOverride={{ height: "25px", width: "25px" }}
                    />
                  ) : (
                    <div className="flex items-center justify-center">
                      <PlusIcon className="w-5" />
                      <Typography className="ml-2 text-[16px] font-normal">
                        Add Chatbot
                      </Typography>
                    </div>
                  )}
                </Button>
              </DialogFooter>
            </Dialog>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminChatbots;
