import { TimeIcon } from "@chakra-ui/icons";
import { IconButton, Tooltip } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const Timer = () => {
    // calculate minutes and seconds until the next 15 minute interval
    const now = new Date();

    let nextInterval: number | string =
        Math.ceil(now.getMinutes() / 15) * 15 === 60
            ? "00"
            : Math.ceil(now.getMinutes() / 15) * 15;
    let nextIntervalHour: number | string =
        nextInterval === "00" ? now.getHours() + 1 : now.getHours();

    if (nextIntervalHour === 0) nextIntervalHour = "00";
    return (
        <Tooltip
            label={`Next notification wave at ${nextIntervalHour}:${nextInterval}`}
        >
            <IconButton
                icon={<TimeIcon />}
                aria-label={`Next notification wave at ${nextIntervalHour}:${nextInterval}`}
                variant="ghost"
            />
        </Tooltip>
    );
};

export default Timer;
