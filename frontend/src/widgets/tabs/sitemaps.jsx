import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  Input,
  Avatar,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Checkbox,
  Typography,
} from "@material-tailwind/react";
import { List, notification } from "antd";
import { TrashIcon } from "@heroicons/react/24/outline";
import Papa from "papaparse";
import ClipLoader from "react-spinners/ClipLoader";

export function SitemapsTab(props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sitemapLoading, setSitemapLoading] = useState(false);
  const [sitemapURL, setSitemapURL] = useState([]);
  const [sitemapURLlist, setSitemapURLlist] = useState([]);
  const [fileList, setFilelist] = useState([]);
  const [fileNameList, setFileNameList] = useState([]);
  const [checkedURLs, setcheckedURLs] = useState([]);

  const handleChangeURL = (e) => {
    setSitemapURL(e.target.value);
  };

  const handleOpen = () => {
    setModalVisible(!modalVisible);
  };

  const handleCheckChange = (e, idx) => {
    let list = checkedURLs;
    list[idx] = e.target.checked;
    let newlist = [...list];
    setcheckedURLs(newlist);
  };

  const handleGetSitemap = () => {
    if (isLink(sitemapURL) == false) {
      notification.warning({
        message: "Please fill out this field correctly.",
      });
      return;
    }
    setSitemapLoading(true);
    axios
      .post(`${process.env.REACT_APP_BASED_URL}/getsitemap`, {
        URL: sitemapURL,
      })
      .then((res) => {
        setModalVisible(true);
        setSitemapURLlist(res.data.data);
        let list = Array(res.data.data.length).fill(false);
        setcheckedURLs(list);
        setSitemapLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setSitemapLoading(false);
      });
  };

  const handleTrain = async () => {
    if (isLink(sitemapURL) == false && fileList.length == 0) {
      notification.warning({
        message: "Please fill out this field correctly.",
      });
      return;
    }
    setLoading(true);
    let list = [];
    let samefiles = 0;
    let samelinks = 0;
    if (fileNameList) {
      for (const file of fileList) {
        if (props.namelist.includes(file.name) == false) {
          await new Promise((resolve, reject) => {
            Papa.parse(file, {
              download: true,
              header: false,
              skipEmptyLines: true,
              complete: async (result) => {
                if (result.data) {
                  result.data.map((item) => {
                    if (
                      list.includes(item[0]) == false &&
                      props.namelist.includes(item[0]) == false
                    ) {
                      list.push(item[0]);
                    } else {
                      samelinks++;
                    }
                  });
                }
                resolve();
              },
              error: (err) => {
                console.log(err);
                reject(err);
              },
            });
          });
        } else {
          samefiles++;
        }
      }
    }
    if (sitemapURLlist) {
      for (let i = 0; i < sitemapURLlist.length; i++) {
        if (checkedURLs[i]) {
          if (props.namelist.includes(sitemapURLlist[i]) == false) {
            list.push(sitemapURLlist[i]);
          } else {
            samelinks++;
          }
        }
      }
    }
    if (samefiles != 0) {
      notification.warning({ message: `${samefiles} files are duplicated` });
    }
    if (samelinks != 0) {
      notification.warning({ message: `${samelinks} links are duplicated` });
    }

    console.log(list);
    axios
      .post(`${process.env.REACT_APP_BASED_URL}/training/sitemap`, {
        links: list,
      })
      .then((res) => {
        props.setDataset(res.data.data);
        notification.success({ message: "Successfully trained." });
        setSitemapURL("");
        setFileNameList(null);
        setFilelist(null);
        setcheckedURLs([]);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        notification.error({ message: err.response.data.message });
        setLoading(false);
      });
    setLoading(false);
  };

  const isLink = (str) => {
    let linkRegex = /^(http:|https:)?\/\/[^\s/$.?#].[^\s]*$/;
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

  const handleDeleteURL = (idx) => {
    let list = [...sitemapURLlist];
    list.splice(idx, 1);
    setSitemapURLlist(list);
  };

  return (
    <>
      <div className="m-1 flex w-full justify-end">
        <a
          href={"public/templates/sitemap.csv"}
          download="Sitemap_template.csv"
          target="_blank"
          rel="noreferrer"
        >
          <div className="flex cursor-pointer items-center">
            <Avatar
              src="img/download.svg"
              className="m-2 h-auto w-[16px] rounded-none"
            />
            <Typography color="black" className="text-[16px] font-semibold">
              Template
            </Typography>
          </div>
        </a>
      </div>
      <div className="flex w-full items-center justify-center">
        <label
          htmlFor="dropzone-file2"
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
            id="dropzone-file2"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
        </label>
      </div>
      <div className="my-2 flex items-center rounded-lg bg-white p-5">
        <Input
          label="Enter a website URL"
          onChange={handleChangeURL}
          className="peer-foucs-none"
        />
        <Button
          onClick={handleGetSitemap}
          className="ml-2 flex h-[40px] w-[120px] items-center justify-center p-0 normal-case"
        >
          {sitemapLoading ? (
            <ClipLoader
              color={"#000000"}
              loading={sitemapLoading}
              size={13}
              cssOverride={{ height: "25px", width: "25px" }}
            />
          ) : (
            <Typography>Get Sitemap</Typography>
          )}
        </Button>
      </div>
      <div className="flex flex-col items-start">
        {fileNameList &&
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
        {sitemapURLlist &&
          sitemapURLlist.map((item, idx) => {
            return (
              <div key={idx} className="w-full">
                {checkedURLs[idx] && (
                  <div className="flex w-full justify-between">
                    <Typography className="text-[16px] text-black">
                      {item}
                    </Typography>
                    <Button
                      variant="text"
                      onClick={() => handleDeleteURL(idx)}
                      className="flex h-8 w-8 items-center justify-center p-0"
                    >
                      <TrashIcon className="w-6" color="black" />
                    </Button>
                  </div>
                )}
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
      <Dialog open={modalVisible} handler={handleOpen}>
        <DialogHeader>Sitemap URLs</DialogHeader>
        <DialogBody divider>
          <List
            bordered
            dataSource={sitemapURLlist}
            renderItem={(item, idx) => (
              <List.Item key={idx} className="flex">
                <div className="flex">
                  <Checkbox
                    id="vertical-list-react"
                    ripple={false}
                    onChange={(e) => handleCheckChange(e, idx)}
                    className="hover:before:opacity-0"
                    containerProps={{
                      className: "p-0 mx-2",
                    }}
                    // checked
                  />
                  {/* <Typography>{item.link}</Typography> */}
                  <Typography>{item}</Typography>
                </div>
                {/* <Typography className="mx-2" >{item.length}</Typography> */}
              </List.Item>
            )}
          />
        </DialogBody>
        <DialogFooter>
          <Button variant="gradient" color="green" onClick={handleOpen}>
            <Typography>Ok</Typography>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default SitemapsTab;
