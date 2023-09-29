import React, { useEffect, useState } from "react";
import {
  Button,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Typography,
} from "@material-tailwind/react";
import FilesTab from "@/widgets/tabs/files";
import LinksTab from "@/widgets/tabs/links";
import SitemapsTab from "@/widgets/tabs/sitemaps";
import FAQsTabs from "@/widgets/tabs/FAQs";
import { TrashIcon } from "@heroicons/react/24/outline";
import { ClipLoader } from "react-spinners";
import apiClient from "../variable";

export function Home() {
  const [loading, setLoading] = useState(false);
  const [dataset, setDataset] = useState([]);
  const [namelist, setNamelist] = useState([]);

  useEffect(() => {
    getDataset();
  }, []);

  useEffect(() => {
    let list = [];
    dataset.map((item) => {
      list.push(item.name);
    });
    setNamelist(list);
  }, [dataset]);

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
    apiClient
      .get("/getDataset")
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
    apiClient
      .post("/deleteDataset", { id: id })
      .then((res) => {
        setLoading(false);
        setDataset(res.data.data);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  return (
    <>
      <div className="relative flex content-center justify-center pb-16 pt-16">
        <div className="max-w-8xl container relative mx-auto mb-10 ">
          <div className="flex h-full flex-col items-center bg-[#b0b7bb]">
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
                    <FilesTab setDataset={setDataset} namelist={namelist} />
                  </TabPanel>
                  <TabPanel key={"Link"} value={"Link"}>
                    <LinksTab setDataset={setDataset} namelist={namelist} />
                  </TabPanel>
                  <TabPanel key={"Sitemap"} value={"Sitemap"}>
                    <SitemapsTab setDataset={setDataset} namelist={namelist} />
                  </TabPanel>
                  <TabPanel key={"FAQs"} value={"FAQs"}>
                    <FAQsTabs setDataset={setDataset} namelist={namelist} />
                  </TabPanel>
                </TabsBody>
              </Tabs>
            </div>
            <div className="ml-auto mr-auto mt-10 flex w-full flex-col px-4 py-5 text-center lg:w-8/12">
              {dataset &&
                dataset.map((item, idx) => {
                  return (
                    <div
                      key={idx}
                      className="flex w-full items-center justify-between border-[1px] border-solid p-2"
                    >
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
        </div>
        {loading && (
          <div className="absolute top-0 z-20 h-full w-full bg-blue-gray-200 bg-opacity-80">
            <div className="flex h-full w-full items-center justify-center">
              <ClipLoader
                color={"#000000"}
                loading={loading}
                size={20}
                cssOverride={{ height: "100px", width: "100px" }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
