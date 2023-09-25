import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  Textarea,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import FilesTab from "@/widgets/tabs/files";
import LinksTab from "@/widgets/tabs/links";
import SitemapsTab from "@/widgets/tabs/sitemaps";
import FAQsTabs from "@/widgets/tabs/FAQs";
import ClipLoader from "react-spinners/ClipLoader";
import { Typography } from "antd";
import { TrashIcon } from "@heroicons/react/24/outline";

export function Home() {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [dataset, setDataset] = useState([]);

  useEffect(() => {
    getDataset();
  }, []);

  const data = [
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
    {
      label: "FAQs",
      value: "FAQs",
    },
  ];

  const getDataset = () => {
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_BASED_URL}/getDataset`)
      .then((res) => {
        setLoading(false);
        setDataset(res.data.data);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  const handleDeleteDataset = (id) => {
    setLoading(true);
    axios
      .post(`${process.env.REACT_APP_BASED_URL}/deleteDataset`, {
        id: id,
      })
      .then((res) => {
        setLoading(false);
        setDataset(res.data.data);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handlepromptsend = () => {
    setLoading(true);
    axios
      .post(`${process.env.REACT_APP_BASED_URL}/prompt`, { prompt: prompt })
      .then((res) => {
        setLoading(false);
        console.log(res.data);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  return (
    <>
      <div className="relative flex h-screen content-center justify-center pb-32 pt-16">
        <div className="max-w-8xl container relative mx-auto">
          <div className="flex flex-col flex-wrap items-center bg-[#b0b7bb]">
            <div className="ml-auto mr-auto mt-10 w-full px-4 py-5 text-center lg:w-8/12">
              <Tabs value="Upload">
                <TabsHeader>
                  {data.map(({ label, value }) => (
                    <Tab key={value} value={value}>
                      {label}
                    </Tab>
                  ))}
                </TabsHeader>
                <TabsBody>
                  <TabPanel key={"Upload"} value={"Upload"}>
                    <FilesTab setDataset={setDataset} dataset={dataset} />
                  </TabPanel>
                  <TabPanel key={"Link"} value={"Link"}>
                    <LinksTab setDataset={setDataset} dataset={dataset} />
                  </TabPanel>
                  <TabPanel key={"Sitemap"} value={"Sitemap"}>
                    <SitemapsTab setDataset={setDataset} dataset={dataset} />
                  </TabPanel>
                  <TabPanel key={"FAQs"} value={"FAQs"}>
                    <FAQsTabs setDataset={setDataset} dataset={dataset} />
                  </TabPanel>
                </TabsBody>
              </Tabs>
            </div>
            <div className="ml-auto mr-auto mt-10 flex w-full flex-col px-4 py-5 text-center lg:w-8/12">
              {dataset &&
                dataset.map((item, idx) => {
                  return (
                    <div key={idx} className="flex w-full justify-between">
                      <Typography>{item.name}</Typography>
                      <Button
                        variant="text"
                        onClick={() => handleDeleteDataset(item._id)}
                        className="flex h-8 w-8 items-center justify-center p-0"
                      >
                        <TrashIcon className="w-6" color="black" />
                      </Button>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="my-5 w-full rounded bg-white p-4">
            <Textarea label="Message" onChange={handlePromptChange} />
            <div className="flex w-full justify-end">
              <Button
                className=" text-[16px] normal-case"
                onClick={handlepromptsend}
              >
                {loading ? (
                  <ClipLoader
                    color={"#000000"}
                    loading={loading}
                    size={13}
                    cssOverride={{ height: "25px", width: "25px" }}
                  />
                ) : (
                  <Typography>Send</Typography>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
