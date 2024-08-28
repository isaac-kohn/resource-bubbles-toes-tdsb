import { useState, useEffect } from "react";
import parseCSV from "./utils/parseCSV";
import axios from "axios";

function App() {
  const [CSVData, setCSVData] = useState();
  useEffect(() => {
    const csvUrl =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQd54SojTwuqlOQoJ2ulyBckwvFaRdNKkaaVIwUx6jYCk8rcFV8r4V74ugBG5ol10oYF0EXHH2tSEKz/pub?gid=0&single=true&output=csv";
    axios
      .get(csvUrl) // Use Axios to fetch the CSV data
      .then((response) => {
        const parsedCsvData = parseCSV(response.data); // Parse the CSV data into an array of objects

        setCSVData(parsedCsvData); // Set the fetched data in the component's state
      })
      .catch((error) => {
        console.error("Error fetching CSV data:", error);
      });
  }, []);

  if (!CSVData) {
    return <span>Loading...</span>;
  }

  const bgColor = CSVData[0]["Background Color"];
  const fillColor = CSVData[0]["Fill Color"];
  const textColor = CSVData[0]["Text Color"];
  const borderColor = CSVData[0]["Border Color"];
  const margin = parseFloat(CSVData[0]["Margin %"]) / 2;
  const outerMargin = parseFloat(CSVData[0]["Outer Margin %"]);

  let numColumns = 1;
  while (true) {
    if (CSVData[0]["Column " + numColumns] === undefined) {
      numColumns--;
      break;
    }
    numColumns++;
  }
  let numRows = 0;
  while (true) {
    if (
      CSVData[numRows]["Column 1"] === "" ||
      CSVData[numRows]["Column 1"] === undefined
    ) {
      break;
    }
    numRows++;
  }

  let componentData = [];
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numColumns; col++) {
      let resourceName = CSVData[row]["Column " + (col + 1)];
      /* check if the bubble takes up more than one unit of space.
      If it does, extend the boundary previous bubble,
      otherwise, create a new bubble */
      let extendHeight =
        row > 0 && resourceName === CSVData[row - 1]["Column " + (col + 1)];
      let extendWidth =
        col > 0 && resourceName === CSVData[row]["Column " + col];

      if (extendWidth && extendHeight) {
      } else if (extendWidth) {
        componentData.filter((comp) => comp["name"] === resourceName)[0].w +=
          (100 - outerMargin) / numColumns;
      } else if (extendHeight) {
        componentData.filter((comp) => comp["name"] === resourceName)[0].h +=
          (100 - outerMargin) / numRows;
      } else {
        let referefnce = CSVData.filter(
          (item) => item["Title"] === resourceName
        )[0]["Link"];
        let [ypos, xpos] = [row / numRows, col / numColumns];

        componentData.push({
          name: resourceName,
          href: referefnce,
          x: outerMargin / 2 + margin + (100 - outerMargin) * xpos,
          y: outerMargin / 2 + margin + (100 - outerMargin) * ypos,
          w: (100 - outerMargin) / numColumns - 2 * margin,
          h: (100 - outerMargin) / numRows - 2 * margin,
          key: row + 10 * col,
        });
      }
    }
  }

  return (
    <div style={{ backgroundColor: bgColor, height: "100vh" }}>
      {componentData.map((comp) => (
        <a
          target="_blank"
          key={comp["key"]}
          href={comp["href"]}
          style={{
            display: "inlineBlock",
            textAlign: "center",
            border: "solid",
            borderColor: borderColor,
            borderWidth: "4px",
            borderRadius: "2vh",
            backgroundColor: fillColor,
            color: textColor,
            textDecoration: "none",
            fontFamily: "myriad-pro, sans-serif",
            fontSize: "4vh",
            position: "absolute",
            left: comp["x"] + "%",
            top: comp["y"] + "%",
            width: comp["w"] + "%",
            height: comp["h"] + "%",
          }}
        >
          <span
            style={{
              display: "inline-block",
              margin: 0,
              position: "absolute",
              width: "100%",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <p style={{ padding: "1vw", textAlign: "center" }}>
              {comp["name"]}
            </p>
          </span>
        </a>
      ))}
    </div>
  );
}

export default App;
