import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Breadcrumbs,
  Input,
  Checkbox,
} from "@material-tailwind/react";
import { ClipLoader } from "react-spinners";
import QRCode from "react-qr-code";
import Lottie from "react-lottie";
import animationData from "@/widgets/lottie/checkAnimation";
import { Avatar, notification } from "antd";
import { HomeIcon } from "@heroicons/react/24/outline";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import PI from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
const ReactPhoneInput = PI.default ? PI.default : PI;

export function Connect() {
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [QRData, setQRData] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneTitle, setPhoneTitle] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    if (auth && auth.userType != process.env.isClient) {
      navigate("/login");
      return;
    }
  }, []);

  const handleConnect = () => {
    if (phoneTitle == "" && !isDisabled) {
      notification.warning({ message: "Please enter a project name" });
      return;
    }
    const ctrl = new AbortController();
    if (phoneNumber == "") {
      notification.warning({ message: "Please enter a phone number" });
      return;
    }
    async function fetchAnswer() {
      setLoading(true);
      try {
        await fetchEventSource(
          `${process.env.REACT_APP_BASED_URL}/dataset/getQRCode`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phone: phoneNumber,
              phoneTitle: isDisabled ? "default" : phoneTitle,
              userId: auth.id,
            }),
            signal: ctrl.signal,
            onmessage: (event) => {
              setLoading(false);
              if (JSON.parse(event.data).data === "[DONE]") {
                setIsSuccess(true);
                ctrl.abort();
              } else if (JSON.parse(event.data).data === "[DoublePhone]") {
                notification.warning({
                  message: "The same phone number already exists.",
                });
                ctrl.abort();
              } else {
                const data = JSON.parse(event.data);
                setQRData(data.data);
              }
            },
          }
        );
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    }
    fetchAnswer();
  };

  return (
    <>
      <div className="flex h-full min-h-screen justify-center">
        <div className="container mx-auto mb-10 h-screen pt-36">
          <Breadcrumbs className="my-2 bg-[#b0b7bb00]">
            <a href="/">
              <HomeIcon className="h-5 w-5 text-[#174483]" />
            </a>
            <a href="/">
              <Typography className="font-normal text-[#174483]">
                Connections
              </Typography>
            </a>
            <a href="/connect">
              <Typography className="font-normal text-[#174483]">
                New Connection
              </Typography>
            </a>
          </Breadcrumbs>
          <Typography className="mb-10 ml-4 text-5xl font-bold">
            New Connection
          </Typography>
          <div className="h-content relative flex flex-wrap justify-between rounded-2xl bg-[#FFFFFFBF] px-10 py-10 backdrop-blur-sm">
            <div className="mx-auto mt-16 flex flex-col">
              <div className="custom-input mb-5 text-left">
                <Typography className="text-md mb-2 w-fit font-medium text-black">
                  Project Name
                </Typography>
                <div className="relative flex w-full">
                  <div className="custom-input w-full">
                    <Input
                      placeholder="Enter Project Name"
                      value={phoneTitle}
                      onChange={(e) => setPhoneTitle(e.target.value)}
                      maxLength={20}
                      disabled={isDisabled}
                      className="!text-black"
                    />
                  </div>
                </div>
              </div>
              <div className="custom-input mb-5 text-left">
                <Typography className="text-md mb-2 w-fit font-medium text-black">
                  Phone Number
                </Typography>
                <div className="relative flex w-full">
                  <ReactPhoneInput
                    id="phoneInput"
                    country={"us"}
                    value={phoneNumber}
                    onChange={(phone) => setPhoneNumber(phone)}
                  />
                </div>
              </div>
              <Checkbox
                label="Already registered?"
                onClick={() => {
                  if (!isDisabled) {
                    setPhoneTitle("");
                  }
                  setIsDisabled(!isDisabled);
                }}
                color="green"
              />
              <div className="flex w-[300px] items-center justify-center">
                <Button
                  variant="filled"
                  onClick={handleConnect}
                  className="w-content mx-auto my-5 flex h-[55px] w-[250px] items-center justify-center rounded-full bg-[#25D366] normal-case shadow-none hover:shadow-none"
                >
                  {loading ? (
                    <ClipLoader
                      color={"#fff"}
                      loading={loading}
                      size={13}
                      cssOverride={{ height: "25px", width: "25px" }}
                    />
                  ) : (
                    <Typography className="text-lg font-normal">
                      <Avatar
                        src="img/whatsapp_icon.svg"
                        className="mr-1 h-auto w-[20px] rounded-none"
                      />
                      Connect WhatsApp
                    </Typography>
                  )}
                </Button>
              </div>
            </div>
            <div className="mx-auto flex h-[400px] w-[400px] items-center justify-center rounded-xl border-2 border-[#00000026] bg-white">
              <div className="relative m-1 flex h-[350px] w-[350px] items-center justify-center text-center">
                {QRData ? (
                  <QRCode value={QRData} className="h-full w-full" />
                ) : (
                  <Typography className=" text-lg font-medium ">
                    Scan the QR Code to link your <br /> Whatsapp Number
                  </Typography>
                )}
                {isSuccess && (
                  <div className="disabled disabled: absolute top-0 h-full w-full bg-[#fff4f47c]">
                    <Lottie
                      options={defaultOptions}
                      isStopped={!isSuccess}
                      isClickToPauseDisabled={true}
                      className="cursor-default"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Connect;
