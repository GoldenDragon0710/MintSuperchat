import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Input,
  Typography,
  Button,
  Breadcrumbs,
  Checkbox,
} from "@material-tailwind/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { HomeIcon } from "@heroicons/react/24/outline";
import { register } from "@/actions/user";
import { ClipLoader } from "react-spinners";

export function AdminRegister() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordShow, setPasswordShow] = useState(false);
  const [usernameRequired, setUsernameRequired] = useState(false);
  const [emailRequired, setEmailRequired] = useState(false);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (auth && auth.userType != process.env.isAdmin) {
      navigate("/admin/login");
      return;
    }
  }, []);

  const handleSubmit = () => {
    if (username == "") {
      setUsernameRequired(true);
      return;
    }
    if (email == "") {
      setEmailRequired(true);
      return;
    }
    if (password == "") {
      setPasswordRequired(true);
      return;
    }
    setLoading(true);
    const data = {
      username,
      email,
      password,
      userType: isAdmin,
    };
    dispatch(register(data))
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  };

  const handleUsernameChange = (e) => {
    if (e.target.value == "") {
      setUsernameRequired(true);
    } else {
      setUsernameRequired(false);
    }
    setUsername(e.target.value);
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
      <div className="flex h-full min-h-screen justify-center">
        <div className="container mx-auto h-full pt-36">
          <Breadcrumbs className="my-2 bg-[#b0b7bb00]">
            <a href="/admin">
              <HomeIcon className="h-5 w-5 text-[#174483]" />
            </a>
            <a href="/admin/register">
              <Typography className="font-normal text-[#174483]">
                Create user
              </Typography>
            </a>
          </Breadcrumbs>
          <Typography className="ml-4 text-5xl font-bold">
            Create user
          </Typography>
          <div className="h-content relative mt-10 flex flex-col flex-wrap items-center justify-center gap-4 rounded-2xl bg-[#FFFFFFBF] p-20 backdrop-blur-sm">
            <div className="mx-8 w-80">
              <Typography className=" font-medium text-black">
                Username
              </Typography>
              <div className="flex items-center rounded border-[1px] border-[#77777763] bg-[#eff2f6]">
                <Input
                  label=""
                  placeholder="Username"
                  value={username}
                  onChange={handleUsernameChange}
                  className="!border-none !text-base !text-black"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                />
              </div>
              {usernameRequired && (
                <Typography color="red" className="text-sm font-normal">
                  *This field is required
                </Typography>
              )}
            </div>
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
            <div className="mx-8 w-80">
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
            <div className="mb-8 flex items-center">
              <Checkbox
                label="Is Super Admin?"
                onClick={() => {
                  setIsAdmin(!isAdmin);
                }}
                color="green"
              />
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
                    Create user
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

export default AdminRegister;
