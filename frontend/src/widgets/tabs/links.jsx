import React, { useState } from "react";
import { Button, Typography, Textarea } from "@material-tailwind/react";
import { notification } from "antd";
import ClipLoader from "react-spinners/ClipLoader";
import { NO_DATA, INCORRECT_LINK, LINKS_DATASETS } from "@/actions/types";
import { useDispatch, useSelector } from "react-redux";
import { trainDatasets } from "@/actions/dataset";

export function LinksTab() {
  const dispatch = useDispatch();
  const botId = localStorage.getItem("botId");
  const datasets = useSelector((state) => state.dataset.datasets);
  const [loading, setLoading] = useState(false);
  const [multiLinksText, setMultiLinksText] = useState("");
  const placeholder = `https://minbo.health
https://minbo.health/about
...
  `;

  const handleTrain = () => {
    let urlList = seperateLinks();
    switch (urlList) {
      case NO_DATA:
        notification.warning({ message: "There is no data to train on." });
        return;
      case INCORRECT_LINK:
        notification.warning({ message: "Please enter correct links." });
        return;
    }
    setLoading(true);
    let list = [];
    let samelinks = 0;
    urlList.map((item) => {
      if (datasets.includes(item) == false) {
        list.push(item);
      } else {
        samelinks++;
      }
    });
    if (samelinks != 0) {
      notification.warning({ message: `${samelinks} links are duplicated.` });
    }
    const data = {
      links: list,
      botId: botId,
      datasetType: LINKS_DATASETS,
    };
    dispatch(trainDatasets(data))
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  };

  const isLink = (str) => {
    let linkRegex = /^(http:|https:)?\/\/[^\s/$.?#].[^\s]*$/;
    return linkRegex.test(str);
  };

  const handleMultiLinksText = (e) => {
    setMultiLinksText(e.target.value);
  };

  const seperateLinks = () => {
    let links = multiLinksText;
    if (links == "") {
      return NO_DATA;
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
      return INCORRECT_LINK;
    }
  };

  return (
    <>
      <div className="my-2 flex flex-col rounded-lg p-5">
        <div className="w-full rounded-lg border-[1px] border-[#17448333] bg-[#17448319]">
          <Textarea
            color="gray"
            value={multiLinksText}
            onChange={handleMultiLinksText}
            rows={4}
            resize={true}
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
        <div className="my-2 flex justify-start italic">
          <Typography className="text-base font-normal text-black">
            You can paste multiple links separated by a new line
          </Typography>
        </div>
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
            Fetch links and Train
          </Typography>
        )}
      </Button>
    </>
  );
}

export default LinksTab;
