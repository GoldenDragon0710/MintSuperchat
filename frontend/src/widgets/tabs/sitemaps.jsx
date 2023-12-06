import React, { useState } from "react";
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
  const datasets = useSelector((state) => state.dataset.datasets);
  const xmlLinks = useSelector((state) => state.dataset.xmlLinks);
  const [loading, setLoading] = useState(false);
  const [sitemapXMLLoading, setSitemapXMLLoading] = useState(false);
  const [sitemapXML, setSitemapXML] = useState("");
  const [fileList, setFilelist] = useState([]);
  const [fileNameList, setFileNameList] = useState([]);
  const [multiLinksText, setMultiLinksText] = useState("");
  const placeholder = `https://minbo.health
https://minbo.health/about
...
  `;

  const handleGetSitemapXML = () => {
    if (isSitemapLink(sitemapXML) == false) {
      s;
      notification.warning({
        message: "Please enter XML link correctly.",
      });
      return;
    }
    setSitemapXMLLoading(true);
    const data = {
      URL: sitemapXML,
    };
    dispatch(getsitemapXML(data))
      .then(() => {
        setSitemapXML("");
        let linkString = multiLinksText;
        if (linkString != "") {
          linkString += "\n";
        }
        xmlLinks.map((item, idx) => {
          linkString += item;
          if (idx != xmlLinks.length - 1) {
            linkString += "\n";
          }
        });
        setMultiLinksText(linkString);
        setSitemapXMLLoading(false);
      })
      .catch(() => {
        setSitemapXMLLoading(false);
      });
  };

  const handleTrain = async () => {
    let urllist = seperateLinks();
    if (urllist == INCORRECT_LINK) {
      notification.warning({ message: "Please enter correct links." });
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

    let samefiles = 0;
    let samelinks = 0;
    for (const file of fileList) {
      if (datasets.includes(file.name) == false) {
        await new Promise((resolve, reject) => {
          Papa.parse(file, {
            download: true,
            header: false,
            skipEmptyLines: true,
            complete: (result) => {
              if (result.data) {
                for (let i = 0; i < result.data.length; i++) {
                  let link = result.data[i][0];
                  if (isLink(link) == false) {
                    notification.warning({
                      message: "File format is incorrectly.",
                    });
                    return;
                  }
                  if (link[link.length - 1] == "/") link = link.slice(0, -1);
                  if (list.includes(link) == false) {
                    if (datasets.includes(link) == false) {
                      list.push(link);
                    }
                  } else {
                    samelinks++;
                  }
                }
                resolve();
              } else {
                notification.warning({ message: "Empty File." });
                return;
              }
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

    if (urllist) {
      for (let i = 0; i < urllist.length; i++) {
        if (
          datasets.includes(urllist[i]) == false ||
          list.includes(urllist[i]) == false
        ) {
          list.push(urllist[i]);
        } else {
          samelinks++;
        }
      }
    }
    if (samefiles != 0) {
      notification.warning({ message: `${samefiles} files are duplicated` });
    }
    if (samelinks != 0) {
      notification.warning({ message: `${samelinks} links are duplicated` });
    }

    setLoading(true);
    const data = {
      links: list,
      botId: botId,
      datasetType: SITEMAPS_DATASETS,
    };
    dispatch(trainDatasets(data))
      .then(() => {
        setFileNameList([]);
        setFilelist([]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const isLink = (str) => {
    let linkRegex = /^(http:|https:)?\/\/[^\s/$.?#].[^\s]*$/;
    return linkRegex.test(str);
  };

  const isSitemapLink = (link) => {
    return (
      link.startsWith("http://") ||
      (link.startsWith("https://") && link.endsWith(".xml"))
    );
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

  const generateCSVfile = () => {
    const data = [
      ["https://minbo.health"],
      ["https://minbo.health/about"],
      ["https://minbo.health/how-it-works"],
    ];
    // Convert data to CSV format
    const csvContent = data.map((row) => row.join(",")).join("\n");

    // Create a Blob object for the CSV file
    const csvBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Save the file using FileSaver.js
    saveAs(csvBlob, "Sitemap_template.csv");
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
      if (!isLink(item)) {
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
          onClick={generateCSVfile}
        >
          <Avatar
            src="img/download.svg"
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
        <div className="mx-auto my-2 flex w-2/3 items-center justify-between">
          <div className="mx-2 w-full rounded-lg border-[1px] border-[#000000] bg-[#00000013]">
            <Input
              onChange={(e) => setSitemapXML(e.target.value)}
              value={sitemapXML}
              label=""
              placeholder="https://www.example.com/sitemap.xml"
              className="h-full !border-0 !text-base !font-normal !text-black focus:border-transparent"
              containerprops={{
                className: "grid h-full",
              }}
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>
          <Button
            onClick={handleGetSitemapXML}
            className="h-[45px] w-[200px] rounded-full bg-black text-sm normal-case shadow-none hover:shadow-none"
          >
            {sitemapXMLLoading ? (
              <ClipLoader
                color={"#ffffff"}
                loading={sitemapXMLLoading}
                size={10}
                cssOverride={{ height: "20px", width: "20px" }}
              />
            ) : (
              <Typography className="text-sm font-medium text-white">
                Load Sitemap
              </Typography>
            )}
          </Button>
        </div>
      </div>
      <Typography className="mt-5 text-lg font-bold text-[#00000067]">
        or upload CSV
      </Typography>
      <div className="flex w-full items-center justify-center p-5">
        <label
          htmlFor="dropzone-file2"
          className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-gradient-to-t from-[#0000000C] from-0% to-[#EFF0F1] to-100%"
        >
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            <Avatar src="img/upload.svg" className="m-2 h-auto w-[5.5rem]" />
            <p className="text-md font-normal text-[#00000080]">
              Click to upload your files or drag and drop them here
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
