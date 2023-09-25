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
  Typography,
} from "@material-tailwind/react";
import FilesTab from "@/widgets/tabs/files";
import LinksTab from "@/widgets/tabs/links";
import SitemapsTab from "@/widgets/tabs/sitemaps";
import FAQsTabs from "@/widgets/tabs/FAQs";
import { TrashIcon } from "@heroicons/react/24/outline";
import { ClipLoader } from "react-spinners";

export function Home() {
  const [loading, setLoading] = useState(false);
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
                        {loading ? (
                          <ClipLoader
                            color={"#000000"}
                            loading={loading}
                            size={13}
                            cssOverride={{ height: "25px", width: "25px" }}
                          />
                        ) : (
                          <TrashIcon className="w-6" color="black" />
                        )}
                      </Button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
