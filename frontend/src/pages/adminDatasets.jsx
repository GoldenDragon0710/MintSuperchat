import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Typography,
  Breadcrumbs,
  Avatar,
} from "@material-tailwind/react";
import FilesTab from "@/widgets/tabs/files";
import LinksTab from "@/widgets/tabs/links";
import SitemapsTab from "@/widgets/tabs/sitemaps";
import { TrashIcon, HomeIcon } from "@heroicons/react/24/outline";
import { ClipLoader } from "react-spinners";
import {
  FILES_DATASETS,
  LINKS_DATASETS,
  SITEMAPS_DATASETS,
  kNOWLEGDE_BASE_TAB,
  TRAIN_TAB,
} from "@/actions/types";
import { deleteDatasets, getDatasets } from "@/actions/dataset";
import { useNavigate } from "react-router-dom";

export function AdminDatasets() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth.user);
  const dataset = useSelector((state) => state.dataset.datasets);
  const phoneTitle = localStorage.getItem("phoneTitle");
  const botId = localStorage.getItem("botId");
  const botTitle = localStorage.getItem("botTitle");
  const [loading, setLoading] = useState(false);
  const [fileDatasets, setFileDatasets] = useState([]);
  const [linkDatasets, setLinkDatasets] = useState([]);
  const [sitemapDatasets, setSitemapDatasets] = useState([]);
  const [trainable, setTrainable] = useState(true);

  useEffect(() => {
    if (auth && auth.userType != process.env.isAdmin) {
      navigate("/admin/login");
      return;
    }
    if (auth && auth.username == null) {
      navigate("/admin/users");
      return;
    }
    if (phoneTitle == null) {
      navigate("/admin/phones");
      return;
    }
    if (botId == null) {
      navigate("/admin/chatbots");
      return;
    }
    const data = { botId: botId };
    setLoading(true);
    dispatch(getDatasets(data))
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (dataset) {
      let filelist = [];
      let linklist = [];
      let sitemaplist = [];
      let list = [];
      dataset.map((item) => {
        switch (item.datasetType) {
          case FILES_DATASETS:
            filelist.push(item);
            break;
          case LINKS_DATASETS:
            linklist.push(item);
            break;
          case SITEMAPS_DATASETS:
            sitemaplist.push(item);
            break;
        }
        list.push(item.name);
      });
      setFileDatasets(filelist);
      setLinkDatasets(linklist);
      setSitemapDatasets(sitemaplist);
    }
  }, [dataset]);

  const tabData = [
    {
      label: "Files",
      value: "Upload",
    },
    {
      label: "Links",
      value: "Link",
    },
    {
      label: "Sitemaps",
      value: "Sitemap",
    },
  ];

  const handleDeleteDataset = (id) => {
    const data = {
      botId: botId,
      id: id,
    };
    setLoading(true);
    dispatch(deleteDatasets(data))
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  };

  return (
    <>
      <div className="flex h-full min-h-screen justify-center">
        <div className="container mx-auto h-full pt-36">
          <Breadcrumbs className="my-2 bg-[#b0b7bb00]">
            <a href="/admin">
              <HomeIcon className="h-5 w-5 text-[#174483]" />
            </a>
            <a href="/admin/users">
              <Typography className="font-normal text-[#174483]">
                Users
              </Typography>
            </a>
            <a href="/admin/phones">
              <Typography className="font-normal text-[#174483]">
                {auth && auth.username}
              </Typography>
            </a>
            <a href="/admin/chatbots">
              <Typography className="font-normal text-[#174483]">
                {phoneTitle}
              </Typography>
            </a>
            <a href="/admin/datasets">
              <Typography className="font-normal text-[#174483]">
                {botTitle}
              </Typography>
            </a>
          </Breadcrumbs>
          <Typography className="mb-8 ml-4 text-5xl font-bold">
            {botTitle}
          </Typography>
          <div className="mx-3 mb-10 rounded-lg ">
            <Tabs value="TRAIN_TAB" id="parentTabId" className="h-full w-fit">
              <TabsHeader
                className="h-[60px] border-[1px] border-[#17448326] bg-transparent"
                indicatorProps={{
                  className: "bg-[#17448326] shadow-none !text-gray-900",
                }}
              >
                <Tab
                  key={kNOWLEGDE_BASE_TAB}
                  value={kNOWLEGDE_BASE_TAB}
                  onClick={() => setTrainable(false)}
                  className="h-[50px] w-fit px-4"
                >
                  <Typography className="w-[200px] text-base font-bold uppercase tracking-wider text-[#174483]">
                    Knowledge base
                  </Typography>
                </Tab>
                <Tab
                  key={TRAIN_TAB}
                  value={TRAIN_TAB}
                  onClick={() => setTrainable(true)}
                  className="h-[50px] w-fit"
                >
                  <Typography className="w-[100px] text-base font-bold uppercase tracking-wider text-[#174483]">
                    Train
                  </Typography>
                </Tab>
              </TabsHeader>
            </Tabs>
            {trainable ? (
              <div className="mx-auto mt-10 w-full rounded-xl bg-[#ffffffa8] py-5 text-center backdrop-blur-sm">
                <Tabs value="Upload" id="childTabId">
                  <TabsHeader
                    className="rounded-none border-b-[1px] border-[#0000002a] bg-transparent px-10 pb-5"
                    indicatorProps={{
                      className: "bg-gray-900/10 shadow-none !text-gray-900",
                    }}
                  >
                    {tabData.map(({ label, value }) => (
                      <Tab
                        key={value}
                        value={value}
                        className="font-medium text-[#174483]"
                      >
                        {label}
                      </Tab>
                    ))}
                  </TabsHeader>
                  <TabsBody className="px-5 pt-5">
                    <TabPanel key={"Upload"} value={"Upload"}>
                      <FilesTab />
                    </TabPanel>
                    <TabPanel key={"Link"} value={"Link"}>
                      <LinksTab />
                    </TabPanel>
                    <TabPanel key={"Sitemap"} value={"Sitemap"}>
                      <SitemapsTab />
                    </TabPanel>
                  </TabsBody>
                </Tabs>
              </div>
            ) : (
              <div className="mt-10 flex w-full flex-col px-4 py-5 text-center">
                {fileDatasets.length != 0 && (
                  <div className="my-2 flex flex-col">
                    <div className="my-2 w-full text-left">
                      <Typography
                        color="black"
                        className="text-md w-full font-bold uppercase"
                      >
                        Files
                      </Typography>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-4">
                      {fileDatasets.map((item, idx) => {
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg bg-white p-4"
                          >
                            <div className="flex items-center">
                              <Avatar
                                src="img/fileDataset.svg"
                                className="mr-2 h-auto w-6"
                              />
                              <Typography className="text-[18px] font-medium text-[#00000080]">
                                {item.title}
                              </Typography>
                            </div>
                            <Button
                              variant="text"
                              onClick={() => handleDeleteDataset(item._id)}
                              className="flex h-8 w-8 items-center justify-center p-0"
                            >
                              <TrashIcon className="w-6 text-black" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {linkDatasets.length != 0 && (
                  <div className="my-2 flex flex-col text-left">
                    <Typography
                      color="black"
                      className="text-md w-full font-bold uppercase"
                    >
                      Links
                    </Typography>
                    <div className="grid w-full grid-cols-2 gap-4">
                      {linkDatasets.map((item, idx) => {
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg bg-white p-4"
                          >
                            <div className="flex items-center">
                              <Avatar
                                src="img/linkDataset.svg"
                                className="mr-2 h-auto w-6"
                              />
                              <Typography className="text-[18px] font-medium text-[#00000080]">
                                {item.title}
                              </Typography>
                            </div>
                            <Button
                              variant="text"
                              onClick={() => handleDeleteDataset(item._id)}
                              className="flex h-8 w-8 items-center justify-center p-0"
                            >
                              <TrashIcon className="w-6 text-black" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {sitemapDatasets.length != 0 && (
                  <div className="my-2 flex flex-col text-left">
                    <Typography
                      color="black"
                      className="text-md w-full font-bold uppercase"
                    >
                      Sitemaps
                    </Typography>
                    <div className="grid w-full grid-cols-2 gap-4">
                      {sitemapDatasets.map((item, idx) => {
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-lg bg-white p-4"
                          >
                            <div className="flex items-center">
                              <Avatar
                                src="img/sitemapDataset.svg"
                                className="mr-2 h-auto w-6"
                              />
                              <Typography className="text-[18px] font-medium text-[#00000080]">
                                {item.title}
                              </Typography>
                            </div>
                            <Button
                              variant="text"
                              onClick={() => handleDeleteDataset(item._id)}
                              className="flex h-8 w-8 items-center justify-center p-0"
                            >
                              <TrashIcon className="w-6 text-black" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDatasets;
