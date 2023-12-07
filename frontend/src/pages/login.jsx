import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Typography, Input } from "@material-tailwind/react";
import { ClipLoader } from "react-spinners";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { login } from "@/actions/auth";

export function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordShow, setPasswordShow] = useState(false);
  const [emailRequired, setEmailRequired] = useState(false);
  const [passwordRequired, setPasswordRequired] = useState(false);

  const handleSubmit = () => {
    if (email == "") {
      setEmailRequired(true);
      return;
    }
    if (password == "") {
      setPasswordRequired(true);
      return;
    }
    setLoading(true);
    const userType = process.env.isClient;
    const data = { email, password, userType };
    dispatch(login(data))
      .then(() => {
        setLoading(false);
        navigate("/");
      })
      .catch(() => setLoading(false));
  };

  const handleEmailChange = (e) => {
    if (e.target.value == "") {
      setEmailRequired(true);
    } else {
      setEmailRequired(false);
    }
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    if (e.target.value == "") {
      setPasswordRequired(true);
    } else {
      setPasswordRequired(false);
    }
    setPassword(e.target.value);
  };

  return (
    <>
      <div className="container mx-auto flex h-full min-h-screen items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex w-full flex-col justify-center">
            <Typography
              variant="h3"
              color="black"
              className="mx-auto font-semibold"
            >
              Welcome to Mintsuperchat
            </Typography>
            <Typography
              variant="h4"
              color="black"
              className="mx-auto font-normal"
            >
              Login to create and manage your bots
            </Typography>
          </div>
          <div className="h-content relative mx-auto mt-10 flex w-max flex-col justify-center rounded-2xl bg-[#FFFFFFBF] p-20 backdrop-blur-sm">
            <div className="mx-8 w-80">
              <Typography className=" font-medium text-black">Email</Typography>
              <div className="flex items-center rounded border-[1px] border-[#77777763] bg-[#eff2f6]">
                <Input
                  label=""
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={handleEmailChange}
                  className="!border-none !text-base !text-black"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>
              {emailRequired && (
                <Typography color="red" className="text-sm font-normal">
                  *This field is required
                </Typography>
              )}
            </div>
            <div className="m-8 w-80">
              <Typography className="font-medium text-black">
                Password
              </Typography>
              <div className="flex items-center rounded border-[1px] border-[#77777763] bg-[#eff2f6]">
                <Input
                  label=""
                  value={password}
                  placeholder="Password"
                  type={passwordShow ? "text" : "password"}
                  onChange={handlePasswordChange}
                  className="!border-none !text-base !text-black"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
                {passwordShow ? (
                  <EyeIcon
                    className="mx-2 h-5 w-5 cursor-pointer"
                    onClick={() => setPasswordShow(!passwordShow)}
                  />
                ) : (
                  <EyeSlashIcon
                    className="mx-2 h-5 w-5 cursor-pointer"
                    onClick={() => setPasswordShow(!passwordShow)}
                  />
                )}
              </div>
              {passwordRequired && (
                <Typography color="red" className="text-sm font-normal">
                  *This field is required
                </Typography>
              )}
            </div>
            <Button
              variant="filled"
              onClick={handleSubmit}
              className="mx-auto mt-3 flex h-[50px] w-[200px] items-center justify-center rounded-full bg-[#174483] normal-case shadow-none hover:shadow-none"
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
                  <Typography className="ml-2 text-[16px] font-normal">
                    Login
                  </Typography>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
