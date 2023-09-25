import React, { useState } from "react";
import axios from "axios";
import { Button, Input, Typography } from "@material-tailwind/react";
import { notification } from "antd";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import ClipLoader from "react-spinners/ClipLoader";

export function LinksTab(props) {
  const [urlNum, setURLNum] = useState(0);
  const [prevURL, setPrevURL] = useState(null);
  const [urlList, setURLList] = useState([]);
  const [disabledURLs, setdisabledURLs] = useState([false]);
  const [saveables, setSaveables] = useState([false]);
  const [addingURL, setAddingURL] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrain = () => {
    setLoading(true);
    let data = [...urlList];
    let list = [];
    let samelinks = 0;
    data.map((item) => {
      if (props.dataset.includes(item) == false) {
        list.push(item);
      } else {
        samelinks++;
      }
    });
    if (samelinks != 0) {
      notification.warning({ message: `${samelinks} links are duplicated.` });
    }

    axios
      .post(`${process.env.REACT_APP_BASED_URL}/training/links`, {
        links: list,
      })
      .then((res) => {
        props.setDataset(res.data.data);
        notification.success({ message: "Successfully trained." });
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        notification.error({ message: err.response.data.message });
        setLoading(false);
      });
  };

  const handleChangeURL = (e, idx) => {
    let list = urlList;
    if (prevURL == null) {
      setPrevURL(list[idx]);
    }
    list[idx] = e.target.value;
    let newlist = [...list];
    setURLList(newlist);
  };

  const handleAddURL = (e) => {
    setAddingURL(e.target.value);
  };

  const handlePlusURL = () => {
    if (
      addingURL == undefined ||
      addingURL == "" ||
      isLink(addingURL) == false
    ) {
      notification.error({ message: "Please fill out this field correctly." });
      return;
    }
    let list = urlList;
    if (list.includes(addingURL)) {
      notification.warning({ message: "The same link already exists." });
      return;
    }
    list.push(addingURL);
    let newlist = [...list];
    setURLList(newlist);
    setURLNum(urlNum + 1);
    settingDisabledURLs(-1);
    setAddingURL("");
  };

  const handleEditableURL = (idx) => {
    settingDisabledURLs(idx);
    settingSaveURLs(idx);
  };

  const handleDeleteURL = (idx) => {
    let disabledlist = disabledURLs;
    disabledlist.splice(idx, 1);
    let newdisablelist = [...disabledlist];
    setdisabledURLs(newdisablelist);

    let saveablelist = saveables;
    saveablelist.splice(idx, 1);
    let newsaveablelist = [...saveablelist];
    setSaveables(newsaveablelist);

    let list = urlList;
    list.splice(idx, 1);
    let newlist = [...list];
    setURLList(newlist);

    setURLNum(urlNum - 1);
  };

  const handleSaveableURL = (idx) => {
    if (isLink(urlList[idx]) == false) {
      notification.error({ message: "Please fill out this field correctly." });
      return;
    }
    settingDisabledURLs(-1);
    settingSaveURLs(-1);
    setPrevURL(null);
  };

  const handleCancelableURL = (idx) => {
    let list = urlList;
    list[idx] = prevURL;
    let newlist = [...list];
    setURLList(newlist);
    setPrevURL(null);
    settingDisabledURLs(-1);
    settingSaveURLs(-1);
  };

  const settingDisabledURLs = (idx) => {
    let list = Array(urlList.length).fill(true);
    if (idx != -1) {
      list[idx] = false;
    }
    let newlist = [...list];
    setdisabledURLs(newlist);
  };

  const settingSaveURLs = (idx) => {
    let list = Array(urlList.length).fill(false);
    if (idx != -1) {
      list[idx] = true;
    }
    let newlist = [...list];
    setSaveables(newlist);
  };

  const isLink = (str) => {
    let linkRegex = /^(http:|https:)?\/\/[^\s/$.?#].[^\s]*$/;
    return linkRegex.test(str);
  };

  return (
    <>
      <div className="my-2 flex flex-col items-center rounded-lg bg-white p-5">
        {Array.from({ length: urlNum }, (_, idx) => {
          return (
            <div key={idx} className="my-2 flex w-full items-center">
              <Input
                label="Enter a website URL"
                onChange={(e) => handleChangeURL(e, idx)}
                value={urlList[idx]}
                className="peer-foucs-none"
                disabled={disabledURLs[idx]}
              />
              {saveables[idx] ? (
                <div className="flex">
                  <Button
                    onClick={() => handleSaveableURL(idx)}
                    className="ml-2 flex h-8 w-8 items-center justify-center p-0"
                    variant="text"
                  >
                    <CheckIcon className="w-6" color="black" />
                  </Button>
                  <Button
                    onClick={() => handleCancelableURL(idx)}
                    className="flex h-8 w-8 items-center justify-center p-0"
                    variant="text"
                  >
                    <XMarkIcon className="w-6" color="black" />
                  </Button>
                </div>
              ) : (
                <div className="flex">
                  <Button
                    onClick={() => handleEditableURL(idx)}
                    className="ml-2 flex h-8 w-8 items-center justify-center p-0"
                    variant="text"
                  >
                    <PencilIcon className="w-6" color="black" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteURL(idx)}
                    className="flex h-8 w-8 items-center justify-center p-0"
                    variant="text"
                  >
                    <TrashIcon className="w-6" color="black" />
                  </Button>
                </div>
              )}
            </div>
          );
        })}
        <div className="my-2 flex w-full items-center">
          <Input
            label="Enter a website URL"
            onChange={handleAddURL}
            value={addingURL}
            className="peer-foucs-none"
          />
          <Button
            onClick={handlePlusURL}
            className="ml-2 flex h-8 w-8 items-center justify-center p-0"
            variant="text"
          >
            <PlusIcon className="w-6" color="black" />
          </Button>
        </div>
      </div>

      <Button
        variant="filled"
        onClick={handleTrain}
        className="my-5 text-[16px] normal-case"
      >
        {loading ? (
          <ClipLoader
            color={"#000000"}
            loading={loading}
            size={13}
            cssOverride={{ height: "25px", width: "25px" }}
          />
        ) : (
          <Typography>Upload and Train</Typography>
        )}
      </Button>
    </>
  );
}

export default LinksTab;
