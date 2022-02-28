import * as d3 from "d3";
import React, { useState } from "react";

import { filterData } from "./handlers";


import "./style.css";
import "bootstrap/dist/css/bootstrap.css";

import FilterPickerBar from "./picker/FilterPickerBar";
import ActiveFilterBar from "./picker/ActiveFilterBar";
import DataVizCanvas from "./DataVizCanvas";

import PORTFOLIO from "./data/iChallenge_PRODUCT_TREE.csv";
import DATA from "./dummyData.json";
let activeFilters = [];

const vizData = [];
d3.csv(PORTFOLIO, (d) => vizData.push(d));

const makroFamilyProps = {
  key: "macroFamily",
  label: "Makro Family",
  list: ["Time & Go", "Solution", "Element"],
};
const familyProps = {
  key: "family",
  label: "Family",
  list: [
    "Sustainable Solutions",
    "Team",
    "Alternative Solutions",
    "Az Solutions",
  ],
};

const pickers = [makroFamilyProps, familyProps];

const App = () => {

  const handleFilterUpdate = () => {
    setFilterPills([...activeFilters]);
    setFilteredData(filterData(pickers, activeFilters));
    console.log(filteredData);
  };

  const [filterPills, setFilterPills] = useState(activeFilters);
  const [filteredData, setFilteredData] = useState(
    filterData(pickers, activeFilters)
  );
  return (
    <>
      <FilterPickerBar pickers={pickers} onUpdateFilters={handleFilterUpdate} />
      <ActiveFilterBar
        onUpdateFilters={handleFilterUpdate}
        activeFilters={filterPills}
      />
      
      <DataVizCanvas  data ={vizData} />
  
    </>
  );
};
export { activeFilters, DATA };
export default App;
