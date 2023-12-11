import React, { useState } from "react";
import { Button, Avatar, Typography } from "@material-tailwind/react";
import ClipLoader from "react-spinners/ClipLoader";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { notification } from "antd";
import { useDispatch } from "react-redux";
import { FILES_DATASETS } from "@/actions/types";
import { trainDatasets } from "@/actions/dataset";

export function FilesTab() {
  const dispatch = useDispatch();
  const botId = localStorage.getItem("botId");
  const [loading, setLoading] = useState(false);
  const [fileList, setFilelist] = useState([]);
  const [fileNameList, setFileNameList] = useState([]);

  const handleTrain = () => {
    if (fileNameList.length == 0) {
      notification.warning({ message: "There is no data to train on." });
      return;
    }
    const formData = new FormData();
    if (fileList) {
      fileList.map((file) => {
        formData.append("files", file);
      });
    }
    formData.append("botId", botId);
    formData.append("datasetType", FILES_DATASETS);
    setLoading(true);
    dispatch(trainDatasets(formData))
      .then(() => {
        setFileNameList([]);
        setFilelist([]);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const handleFileChanger = (e) => {
    let list = [...fileList];
    let filenameList = [...fileNameList];
    if (e.target.files.length != 0) {
      for (let i = 0; i < e.target.files.length; i++) {
        if (filenameList.includes(e.target.files[i].name) == false) {
          list.push(e.target.files[i]);
          filenameList.push(e.target.files[i].name);
        }
      }
      setFileNameList(filenameList);
      setFilelist(list);
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
      <div className="flex w-full items-center justify-center p-5">
        <label
          htmlFor="dropzone-file1"
          className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-gradient-to-t from-[#0000000C] from-0% to-[#EFF0F1] to-100%"
        >
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            <Avatar
              src={`${process.env.REACT_APP_BASED_URL}/images/upload.svg`}
              className="m-2 h-auto w-[5.5rem]"
            />
            <p className="text-md font-normal text-[#00000080]">
              Click to upload your files or drag and drop them here(PDF, Doc,
              Docx, Txt)
            </p>
          </div>
          <input
            id="dropzone-file1"
            type="file"
            accept=".doc,.docx,.pdf,.txt"
            onChange={handleFileChanger}
            className="hidden"
            multiple
          />
        </label>
      </div>
      <div className=" mt-2 flex w-full flex-wrap items-start">
        {fileNameList.length != 0 &&
          fileNameList.map((item, idx) => {
            return (
              <div
                key={idx}
                className=" m-2 flex items-center justify-between rounded-full bg-[#EFF0F1] px-4 py-2"
              >
                <Typography className="mr-2 text-base font-normal text-black">
                  {item}
                </Typography>
                <Button
                  variant="text"
                  onClick={() => handleDeletefile(idx)}
                  className="flex h-5 w-5 items-center justify-center p-0"
                >
                  <XMarkIcon className="w-4" color="black" />
                </Button>
              </div>
            );
          })}
      </div>
      <Button
        variant="filled"
        onClick={handleTrain}
        className="mx-auto my-5 flex h-[55px] w-[200px] items-center justify-center rounded-full bg-[#174483] normal-case shadow-none hover:shadow-none"
      >
        {loading ? (
          <ClipLoader
            color={"#fff"}
            loading={loading}
            size={13}
            cssOverride={{ height: "25px", width: "25px" }}
          />
        ) : (
          <Typography className="text-[16px] font-normal">
            Upload and Train
          </Typography>
        )}
      </Button>
    </>
  );
}

export default FilesTab;
