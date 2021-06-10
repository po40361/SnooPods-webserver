import React from "react";
import { SkipPrevious } from "@material-ui/icons";

export default function Previous(props) {
    const { handleClick } = props;

    return (
        <div>
            <button className="SkipPrev_button" onClick={() => handleClick()}>
                <SkipPrevious style={{color: "white"}}/>
            </button>
            <style>
                {`
        .SkipPrev_button {
          width: fit-content;
          background-color: transparent;
          border: none;
          padding-right: 40px;
        }`}
            </style>
        </div>
    );
}
