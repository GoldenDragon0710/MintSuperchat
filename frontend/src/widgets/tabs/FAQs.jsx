import React, { useState } from "react";
import axios from "axios";
import { Button, Avatar, Typography } from "@material-tailwind/react";
import { notification } from "antd";
import ClipLoader from "react-spinners/ClipLoader";
import { TrashIcon } from "@heroicons/react/24/outline";

export function FAQsTabs(props) {
  const [loading, setLoading] = useState(false);
  const [fileList, setFilelist] = useState([]);
  const [fileNameList, setFileNameList] = useState([]);

  const handleTrain = async () => {
    setLoading(true);
    let samefiles = 0;
    const formData = new FormData();
    if (fileNameList.length != 0) {
      for (let i = 0; i < fileList.length; i++) {
        if (props.dataset.includes(fileList[i].name) == false) {
          formData.append("files", fileList[i]);
        } else {
          samefiles++;
        }
      }
    }
    if (samefiles != 0) {
      notification.warning({ message: `${samefiles} files are duplicated.` });
    }

    axios
      .post(`${process.env.REACT_APP_BASED_URL}/training/FAQs`, formData)
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

  const handleFileChanger = (e) => {
    let filelist = [...fileList];
    let filenameList = [...fileNameList];
    if (e.target.files.length != 0) {
      for (let i = 0; i < e.target.files.length; i++) {
        if (filenameList.includes(e.target.files[i].name) == false) {
          filelist.push(e.target.files[i]);
          filenameList.push(e.target.files[i].name);
        }
      }
      setFileNameList(filenameList);
      setFilelist(filelist);
    }
  };

  const handleDeletefile = (idx) => {
    let list = [...fileNameList];
    list.splice(idx, 1);
    setFileNameList(list);

    let file_list = [...fileList];
    file_list.splice(idx, 1);
    setFilelist(file_list);
  };

  return (
    <>
      <div className="flex w-full items-center justify-center">
        <label
          htmlFor="dropzone-file3"
          className="dark:hover:bg-bray-800 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
        >
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            <Avatar src="img/upload.svg" className="m-2 h-auto w-[2.2rem]" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              Click to upload a file or drag and drop it here
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Up to 100MB in size. CSV
            </p>
          </div>
          <input
            id="dropzone-file3"
            type="file"
            accept=".csv"
            onChange={handleFileChanger}
            className="hidden"
            multiple
          />
        </label>
      </div>
      <div className="flex flex-col items-start">
        {fileNameList.length != 0 &&
          fileNameList.map((item, idx) => {
            return (
              <div key={idx} className="flex w-full justify-between">
                <Typography className="text-[16px] text-black">
                  {item}
                </Typography>
                <Button
                  variant="text"
                  onClick={() => handleDeletefile(idx)}
                  className="flex h-8 w-8 items-center justify-center p-0"
                >
                  <TrashIcon className="w-6" color="black" />
                </Button>
              </div>
            );
          })}
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

export default FAQsTabs;
