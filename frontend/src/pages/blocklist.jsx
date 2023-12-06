import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Typography,
  Input,
  Tooltip,
  Breadcrumbs,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { ClipLoader } from "react-spinners";
import { HomeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import PI from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
const ReactPhoneInput = PI.default ? PI.default : PI;
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getBlocklist,
  addBlocklist,
  deleteBlocklist,
} from "@/actions/blocklist";

export function Blocklist() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const phoneId = localStorage.getItem("phoneId");
  const phoneTitle = localStorage.getItem("phoneTitle");
  const blocklist = useSelector((state) => state.blocklist.blocklist);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [addable, setAddable] = useState(false);
  const [nameRequired, setNameRequired] = useState(false);
  const [phoneRequired, setPhoneRequired] = useState(false);
  const TABLE_HEAD = ["No", "Name", "Phone", "Actions"];

  useEffect(() => {
    if (localStorage.getItem("userType") != "client") {
      navigate("/login");
      return;
    }
    if (phoneId == null) {
      navigate("/");
      return;
    }
    setLoading(true);
    const data = { phoneId: phoneId };
    dispatch(getBlocklist(data))
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, []);

  const handleOpen = () => {
    setAddable((cur) => !cur);
    setNewName("");
    setNewPhone("");
    setNameRequired(false);
    setPhoneRequired(false);
  };

  const handleNewName = (e) => {
    if (e.target.value == "") {
      setNameRequired(true);
    } else {
      setNameRequired(false);
    }
    setNewName(e.target.value);
  };

  const handleNewPhone = (phone) => {
    if (phone == "") {
      setPhoneRequired(true);
    } else {
      setPhoneRequired(false);
      setNewPhone(phone);
    }
  };

  const handleAdd = () => {
    if (newName == "") {
      setNameRequired(true);
      return;
    }
    if (newPhone == "") {
      setPhoneRequired(true);
      return;
    }
    const data = { name: newName, phone: newPhone, phoneId: phoneId };
    setLoading(true);
    dispatch(addBlocklist(data))
      .then(() => {
        setAddable(false);
        setNewName("");
        setNewPhone("");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleDelete = (id) => {
    const data = { id: id, phoneId: phoneId };
    setLoading(true);
    dispatch(deleteBlocklist(data))
      .then(() => setLoading(false))
      .then(() => setLoading(false));
  };

  return (
    <>
      <div className="flex h-full min-h-screen justify-center pb-16">
        <div className="container mx-auto h-full pt-36 ">
          <Breadcrumbs className="my-2 bg-[#b0b7bb00]">
            <a href="/">
              <HomeIcon className="h-5 w-5 text-[#174483]" />
            </a>
            <a href="/">
              <Typography className="font-normal text-[#174483]">
                Connections
              </Typography>
            </a>
            <a href="/chatbots">
              <Typography className="font-normal text-[#174483]">
                {phoneTitle}
              </Typography>
            </a>
            <a href="/blocklist">
              <Typography className="font-normal text-[#174483]">
                Blocklist
              </Typography>
            </a>
          </Breadcrumbs>
          <div className="flex w-full justify-between">
            <Typography className="ml-4 text-5xl font-bold">
              Block List
            </Typography>
            <div className="flex ">
              <Button
                variant="outlined"
                onClick={() => setAddable(true)}
                className="mx-auto flex h-[50px] w-[200px] items-center justify-center rounded-full border-[#174483]  normal-case text-[#174483] shadow-none hover:shadow-none"
              >
                <PlusIcon className="w-5" />
                <Typography className="mx-2 text-[16px] font-semibold">
                  Add Block User
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
                            className="text-base font-semibold leading-none"
                          >
                            {head}
                          </Typography>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {blocklist &&
                      blocklist.map((item, index) => {
                        const isLast = index === blocklist.length - 1;
                        const classes = isLast
                          ? "p-4"
                          : "p-4 border-b border-blue-gray-50";

                        return (
                          <tr key={index}>
                            <td className={classes}>
                              <div className="flex gap-3">
                                <div className="mx-2 flex items-center">
                                  <Typography
                                    variant="small"
                                    color="black"
                                    className=" text-base font-normal"
                                  >
                                    {index + 1}
                                  </Typography>
                                </div>
                              </div>
                            </td>
                            <td className={classes}>
                              <div className="flex gap-3">
                                <div className="mx-2 flex items-center">
                                  <Typography
                                    variant="small"
                                    color="black"
                                    className=" text-base font-normal"
                                  >
                                    {item.name}
                                  </Typography>
                                </div>
                              </div>
                            </td>
                            <td className={classes}>
                              <div className="flex gap-3">
                                <div className="mx-2 flex items-center">
                                  <Typography
                                    variant="small"
                                    color="black"
                                    className=" text-base font-normal"
                                  >
                                    +{item.phone}
                                  </Typography>
                                </div>
                              </div>
                            </td>
                            <td className={classes}>
                              <div className=" flex w-max cursor-pointer items-center">
                                <Tooltip content="Delete">
                                  <div
                                    className="flex items-center"
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
                  New Block User
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
                <div className="mx-auto max-w-[300px]">
                  <div className="w-full">
                    <Typography className="font-bold text-black">
                      Name
                    </Typography>
                    <div className="rounded-lg border-[1px] border-[#00000036]">
                      <Input
                        label=""
                        onChange={handleNewName}
                        value={newName}
                        maxLength={30}
                        placeholder="My Awesome Chatbot"
                        className="min-h-full !border-0 !text-base !font-normal !text-black focus:border-transparent"
                        containerProps={{
                          className: "grid h-full",
                        }}
                        labelProps={{
                          className: "before:content-none after:content-none",
                        }}
                      />
                    </div>
                    {nameRequired && (
                      <Typography color="red" className="text-sm font-normal">
                        *This field is required
                      </Typography>
                    )}
                  </div>
                  <div className="my-3 w-full">
                    <Typography className="font-bold text-black">
                      Phone
                    </Typography>
                    <ReactPhoneInput
                      id="phoneInput"
                      country={"us"}
                      value={newPhone}
                      inputStyle={{
                        color: "black",
                        fontWeight: 400,
                        width: "100%",
                      }}
                      onChange={handleNewPhone}
                    />
                    {phoneRequired && (
                      <Typography color="red" className="text-sm font-normal">
                        *This field is required
                      </Typography>
                    )}
                  </div>
                </div>
              </DialogBody>
              <DialogFooter>
                <Button
                  variant="filled"
                  onClick={handleAdd}
                  className="mx-2 flex h-[50px] w-[200px] items-center justify-center rounded-full bg-[#174483] normal-case shadow-none hover:shadow-none"
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
                        Add Block User
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

export default Blocklist;
