import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Input,
  Avatar,
  Typography,
  Textarea,
} from "@material-tailwind/react";
import { notification } from "antd";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Papa from "papaparse";
import ClipLoader from "react-spinners/ClipLoader";
import { getsitemapXML, trainDatasets } from "@/actions/dataset";
import { NO_DATA, INCORRECT_LINK, SITEMAPS_DATASETS } from "@/actions/types";
import { saveAs } from "file-saver";

export function SitemapsTab() {
  const dispatch = useDispatch();
  const botId = localStorage.getItem("botId");
  const [loading, setLoading] = useState(false);
  const [fileList, setFilelist] = useState([]);
  const [fileNameList, setFileNameList] = useState([]);
  const [multiLinksText, setMultiLinksText] = useState("");
  const placeholder = `https://www.example1.com/sitemap.xml
https://www.example2.com/sitemap.xml
...
  `;

  const handleTrain = async () => {
    let urllist = seperateLinks();
    if (urllist == INCORRECT_LINK) {
      notification.warning({ message: "Please enter correct xml links." });
      return;
    }
    if (urllist == NO_DATA) {
      if (fileNameList.length == 0) {
        notification.warning({ message: "There is no data to train on." });
        return;
      } else {
        urllist = [];
      }
    }
    let list = [];
    if (urllist) {
      urllist.map((item) => {
        list.push(item);
      });
    }
    const formData = new FormData();
    if (fileList) {
      fileList.map((file) => {
        formData.append("files", file);
      });
    }
    formData.append("botId", botId);
    formData.append("xmlLinks", list);
    formData.append("datasetType", SITEMAPS_DATASETS);
    setLoading(true);
    dispatch(trainDatasets(formData))
      .then(() => {
        setMultiLinksText("");
        setFileNameList([]);
        setFilelist([]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const isXMLLink = (str) => {
    let linkRegex = /^(http:|https:)?\/\/[^\s/$.?#].[^\s]*\.xml$/;
    return linkRegex.test(str);
  };

  const handleFileChange = (e) => {
    let list = [...fileList];
    for (let i = 0; i < e.target.files.length; i++) {
      if (list.includes(e.target.files[i]) == false) {
        list.push(e.target.files[i]);
      }
    }
    let filenameList = [...fileNameList];
    for (let i = 0; i < list.length; i++) {
      if (filenameList.includes(list[i].name) == false) {
        filenameList.push(list[i].name);
      }
    }
    setFileNameList(filenameList);
    setFilelist(list);
  };

  const handleDeletefile = (idx) => {
    let list = [...fileNameList];
    list.splice(idx, 1);
    setFileNameList(list);

    let file_list = [...fileList];
    file_list.splice(idx, 1);
    setFilelist(file_list);
  };

  const handleMultiLinksText = (e) => {
    setMultiLinksText(e.target.value);
  };

  const seperateLinks = () => {
    let links = multiLinksText;
    if (links == "") {
      return process.env.NO_DATA;
    }
    let arr = links.split("\n");
    let flag = 0;
    arr.map((item) => {
      if (!isXMLLink(item)) {
        return;
      }
      flag++;
    });
    if (flag == arr.length) {
      return arr;
    } else {
      return process.env.INCORRECT_LINK;
    }
  };

  return (
    <>
      <div className="m-1 flex w-full justify-end">
        <div
          className="flex cursor-pointer items-center"
          // onClick={generateXMLfile}
        >
          <Avatar
            src={`${process.env.REACT_APP_BASED_URL}/images/download.svg`}
            className="m-2 h-auto w-[20px] rounded-none"
          />
          <Typography className="text-[16px] font-semibold text-[#174483]">
            Template
          </Typography>
        </div>
      </div>
      <div className="flex flex-col rounded-lg px-5">
        <div className="w-full rounded-lg border-[1px] border-[#17448333] bg-[#17448319]">
          <Textarea
            color="gray"
            value={multiLinksText}
            rows={4}
            resize={true}
            onChange={handleMultiLinksText}
            placeholder={placeholder}
            className="h-full !border-0 !text-base !font-normal focus:border-transparent"
            containerprops={{
              className: "grid h-full",
            }}
            labelProps={{
              className: "before:content-none after:content-none",
            }}
          />
        </div>
        <div className="mx-auto my-2 flex w-full items-center">
          <Typography className="text-sm font-normal italic text-black">
            You can paste multiple links seperated by a new line
          </Typography>
        </div>
      </div>
      <Typography className="mt-5 text-lg font-bold text-[#00000067]">
        or upload XML
      </Typography>
      <div className="flex w-full items-center justify-center p-5">
        <label
          htmlFor="dropzone-file2"
          className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-gradient-to-t from-[#0000000C] from-0% to-[#EFF0F1] to-100%"
        >
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            <Avatar
              src={`${process.env.REACT_APP_BASED_URL}/images/upload.svg`}
              className="m-2 h-auto w-[5.5rem]"
            />
            <p className="text-md font-normal text-[#00000080]">
              Click to upload your files or drag and drop them here
            </p>
          </div>
          <input
            id="dropzone-file2"
            type="file"
            accept=".xml"
            onChange={handleFileChange}
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
        className="mx-auto my-5 flex h-[55px] w-[250px] items-center justify-center rounded-full bg-[#174483] normal-case shadow-none hover:shadow-none"
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
            Add sitemaps and Train
          </Typography>
        )}
      </Button>
    </>
  );
}

export default SitemapsTab;
